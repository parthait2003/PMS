"use client";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState, Fragment, useRef } from "react";
import sortBy from "lodash/sortBy";
import IconFile from "@/components/icon/icon-file";
import { Dialog, Transition, Tab } from "@headlessui/react";
import IconPrinter from "@/components/icon/icon-printer";
import IconPlus from "../icon/icon-plus";
import Link from "next/link";
import axios from "axios";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { useSelector } from "react-redux";
import { IRootState } from "@/store";
const rowData = [
  {
    id: 1,
    firstName: "Caroline",
    lastName: "Jensen",
    email: "carolinejensen@zidant.com",
    dob: "2004-05-28",
    // address: {
    //     street: '529 Scholes Street',
    //     city: 'Temperanceville',
    //     zipcode: 5235,
    //     geo: {
    //         lat: 23.806115,
    //         lng: 164.677197,
    //     },
    // },
    phone: "+1 (821) 447-3782",
    isActive: true,
    age: 39,
    company: "POLARAX",
  },
];

const col = [
  "id",
  "firstName",
  "lastName",
  "company",
  "age",
  "dob",
  "email",
  "phone",
];

const ComponentsDatatablesDoucument = () => {
  const [modal1, setModal1] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [initialRecords, setInitialRecords] = useState(sortBy(rowData, "id"));
  const [recordsData, setRecordsData] = useState(initialRecords);
  const [customerData, setCustomerData] = useState([]);
  const [cutomerid, setcutomerid] = useState("");

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const isRtl =
    useSelector((state: IRootState) => state.themeConfig.rtlClass) === "rtl";
  const [date1, setDate1] = useState<any>("2022-07-05");
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "id",
    direction: "asc",
  });

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await fetch("/api/customer"); // Assuming API endpoint is relative
        if (!response.ok) {
          throw new Error("Failed to fetch customer data");
        }
        const data = await response.json();

        setCustomerData(data.customer);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecordsData([...initialRecords.slice(from, to)]);
  }, [page, pageSize, initialRecords]);

  useEffect(() => {
    setInitialRecords(() => {
      return rowData.filter((item: any) => {
        return (
          item.id.toString().includes(search.toLowerCase()) ||
          item.firstName.toLowerCase().includes(search.toLowerCase()) ||
          item.lastName.toLowerCase().includes(search.toLowerCase()) ||
          item.company.toLowerCase().includes(search.toLowerCase()) ||
          item.email.toLowerCase().includes(search.toLowerCase()) ||
          item.age.toString().toLowerCase().includes(search.toLowerCase()) ||
          item.dob.toLowerCase().includes(search.toLowerCase()) ||
          item.phone.toLowerCase().includes(search.toLowerCase())
        );
      });
    });
  }, [search]);
  const handleAddCustomerClick = (e) => {
    e.stopPropagation();
    setShowAddCustomer(!showAddCustomer); // Toggle the visibility
  };
  useEffect(() => {
    const data = sortBy(initialRecords, sortStatus.columnAccessor);
    setInitialRecords(sortStatus.direction === "desc" ? data.reverse() : data);
    setPage(1);
  }, [sortStatus]);

  const formatDate = (date: any) => {
    if (date) {
      const dt = new Date(date);
      const month =
        dt.getMonth() + 1 < 10 ? "0" + (dt.getMonth() + 1) : dt.getMonth() + 1;
      const day = dt.getDate() < 10 ? "0" + dt.getDate() : dt.getDate();
      return day + "/" + month + "/" + dt.getFullYear();
    }
    return "";
  };

  const getcustomeval = () => {
    const options = customerData.map((customer) => ({
      value: customer._id,
      label: `${customer.firstName} ${
        customer.middleName ? customer.middleName + " " : ""
      }${customer.lastName} - ${customer.mobile}`,
    }));
    setOptions(options);
    setModal1(true);
  };

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    const newFiles = Array.from(selectedFiles);
    setFiles([...files, ...newFiles]);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      console.error("No files selected");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response.data);
      // Clear the files after successful upload
      setFiles([]);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    const newFiles = Array.from(droppedFiles);
    setFiles([...files, ...newFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const removeFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const exportTable = (type: any) => {
    let columns: any = col;
    let records = rowData;
    let filename = "table";

    let newVariable: any;
    newVariable = window.navigator;

    if (type === "csv") {
      let coldelimiter = ";";
      let linedelimiter = "\n";
      let result = columns
        .map((d: any) => {
          return capitalize(d);
        })
        .join(coldelimiter);
      result += linedelimiter;
      records.map((item: any) => {
        columns.map((d: any, index: any) => {
          if (index > 0) {
            result += coldelimiter;
          }
          let val = item[d] ? item[d] : "";
          result += val;
        });
        result += linedelimiter;
      });

      if (result == null) return;
      if (!result.match(/^data:text\/csv/i) && !newVariable.msSaveOrOpenBlob) {
        var data =
          "data:application/csv;charset=utf-8," + encodeURIComponent(result);
        var link = document.createElement("a");
        link.setAttribute("href", data);
        link.setAttribute("download", filename + ".csv");
        link.click();
      } else {
        var blob = new Blob([result]);
        if (newVariable.msSaveOrOpenBlob) {
          newVariable.msSaveBlob(blob, filename + ".csv");
        }
      }
    } else if (type === "print") {
      var rowhtml = "<p>" + filename + "</p>";
      rowhtml +=
        '<table style="width: 100%; " cellpadding="0" cellcpacing="0"><thead><tr style="color: #515365; background: #eff5ff; -webkit-print-color-adjust: exact; print-color-adjust: exact; "> ';
      columns.map((d: any) => {
        rowhtml += "<th>" + capitalize(d) + "</th>";
      });
      rowhtml += "</tr></thead>";
      rowhtml += "<tbody>";
      records.map((item: any) => {
        rowhtml += "<tr>";
        columns.map((d: any) => {
          let val = item[d] ? item[d] : "";
          rowhtml += "<td>" + val + "</td>";
        });
        rowhtml += "</tr>";
      });
      rowhtml +=
        "<style>body {font-family:Arial; color:#495057;}p{text-align:center;font-size:18px;font-weight:bold;margin:15px;}table{ border-collapse: collapse; border-spacing: 0; }th,td{font-size:12px;text-align:left;padding: 4px;}th{padding:8px 4px;}tr:nth-child(2n-1){background:#f7f7f7; }</style>";
      rowhtml += "</tbody></table>";
      var winPrint: any = window.open(
        "",
        "",
        "left=0,top=0,width=1000,height=600,toolbar=0,scrollbars=0,status=0"
      );
      winPrint.document.write("<title>Print</title>" + rowhtml);
      winPrint.document.close();
      winPrint.focus();
      winPrint.print();
    } else if (type === "txt") {
      let coldelimiter = ",";
      let linedelimiter = "\n";
      let result = columns
        .map((d: any) => {
          return capitalize(d);
        })
        .join(coldelimiter);
      result += linedelimiter;
      records.map((item: any) => {
        columns.map((d: any, index: any) => {
          if (index > 0) {
            result += coldelimiter;
          }
          let val = item[d] ? item[d] : "";
          result += val;
        });
        result += linedelimiter;
      });

      if (result == null) return;
      if (!result.match(/^data:text\/txt/i) && !newVariable.msSaveOrOpenBlob) {
        var data1 =
          "data:application/txt;charset=utf-8," + encodeURIComponent(result);
        var link1 = document.createElement("a");
        link1.setAttribute("href", data1);
        link1.setAttribute("download", filename + ".txt");
        link1.click();
      } else {
        var blob1 = new Blob([result]);
        if (newVariable.msSaveOrOpenBlob) {
          newVariable.msSaveBlob(blob1, filename + ".txt");
        }
      }
    }
  };

  const capitalize = (text: any) => {
    return text
      .replace("_", " ")
      .replace("-", " ")
      .toLowerCase()
      .split(" ")
      .map((s: any) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(" ");
  };
  const [formData, setFormData] = useState({
    documenttype: "",
    documentstatus: "",
    validationsource: "",
    number: "",
    issue: "",
    state: "",
    cardnumber: "",
    description: "",
  });
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    console.log(value);
    setFormData((formData) => ({
      ...formData,
      [name]: value,
    }));
  };

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      expirydate: date1,
      id: cutomerid,
    }));
  }, [cutomerid]);

  const handleFormSubmit = async (event: any) => {
    event.preventDefault();

    console.log(formData);
  };
  return (
    <div className="panel mt-6">
      <h5 className="mb-5 text-lg font-semibold dark:text-white-light">
        Documents
      </h5>

      <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div className="flex flex-wrap items-center">
          <div className="mb-5">
            <div className="flex items-center justify-center"></div>
            <Transition appear show={modal1} as={Fragment}>
              <Dialog as="div" open={modal1} onClose={() => setModal1(false)}>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0" />
                </Transition.Child>
                <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                  <div className="flex min-h-screen items-start justify-center px-4">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <Dialog.Panel
                        as="div"
                        className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark"
                      >
                        <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                          <div className="text-lg font-bold">Add Document</div>
                          <button
                            type="button"
                            className="text-white-dark hover:text-dark"
                            onClick={() => setModal1(false)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                            >
                              <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z" />
                            </svg>
                          </button>
                        </div>
                        <div className="p-5">
                          <div className="mb-5">
                            <form
                              className="space-y-5"
                              onSubmit={handleFormSubmit}
                            >
                              <div>
                                <div>
                                  <label htmlFor="ctnFile">
                                    Drop pdf or image file here
                                  </label>

                                  <div
                                    style={{
                                      width: "100%",
                                      minHeight: "200px",
                                      border: "2px dashed #ccc",
                                      borderRadius: "10px",
                                      padding: "20px",
                                      display: "flex",
                                      flexDirection: "column",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      cursor: "pointer",
                                    }}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onClick={handleClick}
                                  >
                                    {files.length > 0 ? (
                                      <ul>
                                        {files.map((file, index) => (
                                          <li key={index}>
                                            {file.name} -{" "}
                                            <button
                                              onClick={() => removeFile(index)}
                                            >
                                              <svg
                                                className="h-8 w-8 pt-[12px] text-red-500"
                                                width={24}
                                                height={24}
                                                viewBox="0 0 24 24"
                                                strokeWidth={1}
                                                stroke="currentColor"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              >
                                                {" "}
                                                <path
                                                  stroke="none"
                                                  d="M0 0h24v24H0z"
                                                />{" "}
                                                <line
                                                  x1={4}
                                                  y1={7}
                                                  x2={20}
                                                  y2={7}
                                                />{" "}
                                                <line
                                                  x1={10}
                                                  y1={11}
                                                  x2={10}
                                                  y2={17}
                                                />{" "}
                                                <line
                                                  x1={14}
                                                  y1={11}
                                                  x2={14}
                                                  y2={17}
                                                />{" "}
                                                <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />{" "}
                                                <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                                              </svg>
                                            </button>
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p>Click or drag & drop files here</p>
                                    )}
                                  </div>
                                  <input
                                    type="file"
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                    ref={fileInputRef}
                                    multiple
                                  />
                                  <div className="flex flex-col items-center">
                                    <button
                                      onClick={handleUpload}
                                      className="mt--10"
                                    >
                                      <svg
                                        className="mt-[-20px] h-12 w-12 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M8 17a5 5 0 01-.916-9.916 5.002 5.002 0 019.832 0A5.002 5.002 0 0116 17m-7-5l3-3m0 0l3 3m-3-3v12"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <label htmlFor="groupFname">
                                  Customer Name
                                </label>

                                <div>
                                  <div className="flex">
                                    <div className="w-11/12">
                                      <Select
                                        placeholder="Select an option"
                                        options={options}
                                        onChange={(t) => {
                                          console.log(t.value);
                                          setcutomerid(t.value);
                                        }}
                                      />
                                    </div>
                                    <div className="flex w-1/12 items-center justify-center">
                                      <button onClick={handleAddCustomerClick}>
                                        <svg
                                          className="h-8 w-8 text-gray-500"
                                          width={24}
                                          height={24}
                                          viewBox="0 0 24 24"
                                          strokeWidth={2}
                                          stroke="currentColor"
                                          fill="none"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          {" "}
                                          <path
                                            stroke="none"
                                            d="M0 0h24v24H0z"
                                          />{" "}
                                          <line
                                            x1={12}
                                            y1={5}
                                            x2={12}
                                            y2={19}
                                          />{" "}
                                          <line
                                            x1={16}
                                            y1={15}
                                            x2={12}
                                            y2={19}
                                          />{" "}
                                          <line
                                            x1={8}
                                            y1={15}
                                            x2={12}
                                            y2={19}
                                          />
                                        </svg>
                                      </button>{" "}
                                    </div>
                                    {showAddCustomer && (
                                      <div className="w-45 absolute right-10 mt-10 border border-gray-200 bg-white p-4">
                                        <Link href={"/addcustomer"}>
                                          {" "}
                                          <div className="flex">
                                            <div>
                                              <svg
                                                className="h-6 w-6 text-gray-500"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={1}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              >
                                                {" "}
                                                <line
                                                  x1={12}
                                                  y1={5}
                                                  x2={12}
                                                  y2={19}
                                                />{" "}
                                                <line
                                                  x1={5}
                                                  y1={12}
                                                  x2={19}
                                                  y2={12}
                                                />
                                              </svg>
                                            </div>
                                            <div>
                                              {" "}
                                              <p>Add Customer</p>
                                            </div>
                                          </div>
                                        </Link>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <label htmlFor="ctnSelect1">
                                  Document type
                                </label>
                                <select
                                  className="form-select text-white-dark"
                                  name="documenttype"
                                  onChange={handleChange}
                                >
                                  <option>Driver's license</option>
                                  <option>Passport</option>
                                  <option>Tazkera</option>
                                  <option>refuje card</option>
                                  <option>proof of age</option>
                                </select>
                              </div>

                              <div>
                                <label htmlFor="ctnSelect1">
                                  Document status
                                </label>
                                <select
                                  className="form-select text-white-dark"
                                  name="documentstatus"
                                  onChange={handleChange}
                                >
                                  <option>pending</option>
                                  <option>approved</option>
                                  <option>expired</option>
                                  <option>rejected</option>
                                  <option>deleted</option>
                                </select>
                              </div>

                              <div>
                                <label htmlFor="groupFname">
                                  Validation Source
                                </label>
                                <input
                                  id="groupFname"
                                  type="text"
                                  name="validationsource"
                                  placeholder="Enter validation source"
                                  onChange={handleChange}
                                  className="form-input"
                                />
                              </div>

                              <div>
                                <label htmlFor="groupFname">Number</label>
                                <input
                                  id="groupFname"
                                  type="text"
                                  name="number"
                                  className="form-input"
                                  onChange={handleChange}
                                />
                              </div>

                              <div>
                                <label htmlFor="groupFname">issue</label>
                                <input
                                  id="groupFname"
                                  type="text"
                                  name="issue"
                                  className="form-input"
                                  onChange={handleChange}
                                />
                              </div>

                              <div>
                                <label htmlFor="groupFname">State</label>

                                <select
                                  className="form-select text-white-dark"
                                  onChange={handleChange}
                                  name="state"
                                >
                                  <option value="ACT">ACT</option>
                                  <option value="NSW">NSW</option>
                                  <option value="NT">NT</option>
                                  <option value="QLD">QLD</option>
                                  <option value="SA">SA</option>
                                  <option value="TAS">TAS</option>
                                  <option value="VIC">VIC</option>
                                  <option value="WA">WA</option>
                                </select>
                              </div>

                              <div>
                                <label htmlFor="groupFname">Card Number</label>
                                <input
                                  id="groupFname"
                                  type="text"
                                  name="cardnumber"
                                  className="form-input"
                                  onChange={handleChange}
                                />
                              </div>

                              <div>
                                <label className="flex cursor-pointer items-center">
                                  <input
                                    type="checkbox"
                                    className="form-checkbox"
                                    onChange={handleChange}
                                    defaultChecked
                                  />
                                  <span className=" text-white-dark">
                                    Is Identity
                                  </span>
                                </label>
                              </div>

                              <div>
                                <label className="flex cursor-pointer items-center">
                                  <input
                                    type="checkbox"
                                    className="form-checkbox"
                                    onChange={handleChange}
                                    defaultChecked
                                  />
                                  <span className=" text-white-dark">
                                    Is address
                                  </span>
                                </label>
                              </div>
                              <div>
                                <label htmlFor="ctnTextarea">Expiry Date</label>

                                <Flatpickr
                                  value={date1}
                                  options={{
                                    dateFormat: "Y-m-d",
                                  }}
                                  className="form-input"
                                  onChange={(t) => {
                                    console.log("Selected Date:", t[0]); // Logging selected date to console
                                    setDate1(t[0]);
                                    handleChange;
                                  }}
                                  name="expirydate"
                                />
                              </div>
                              <div>
                                <label htmlFor="ctnTextarea">Description</label>
                                <textarea
                                  id="ctnTextarea"
                                  rows={3}
                                  className="form-textarea"
                                  name="description"
                                  onChange={handleChange}
                                ></textarea>
                              </div>

                              <button
                                type="submit"
                                className="btn btn-primary !mt-6"
                              >
                                Submit
                              </button>
                            </form>
                          </div>
                        </div>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition>
          </div>
          <button
            type="button"
            className="btn btn-primary my-5"
            onClick={() => getcustomeval()}
          >
            {" "}
            <IconPlus className="ltr:mr-2 rtl:ml-2" />
            Add Document
          </button>
          <button
            type="button"
            onClick={() => exportTable("csv")}
            className="btn btn-primary btn-sm m-1 "
          >
            <IconFile className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
            CSV
          </button>
          <button
            type="button"
            onClick={() => exportTable("txt")}
            className="btn btn-primary btn-sm m-1"
          >
            <IconFile className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
            TXT
          </button>

          <button
            type="button"
            onClick={() => exportTable("print")}
            className="btn btn-primary btn-sm m-1"
          >
            <IconPrinter className="ltr:mr-2 rtl:ml-2" />
            PRINT
          </button>
        </div>

        <input
          type="text"
          className="form-input w-auto"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="datatables">
        <DataTable
          highlightOnHover
          className="table-hover whitespace-nowrap"
          records={recordsData}
          columns={[
            { accessor: "id", title: "#", sortable: true },
            { accessor: "firstName", sortable: true },
            { accessor: "lastName", sortable: true },
            { accessor: "company", title: "Company", sortable: true },
            { accessor: "age", title: "Age", sortable: true },
            {
              accessor: "dob",
              title: "Start Date",
              sortable: true,
              render: ({ dob }) => <div>{formatDate(dob)}</div>,
            },
            { accessor: "email", sortable: true },
            { accessor: "phone", sortable: true },
          ]}
          totalRecords={initialRecords.length}
          recordsPerPage={pageSize}
          page={page}
          onPageChange={(p) => setPage(p)}
          recordsPerPageOptions={PAGE_SIZES}
          onRecordsPerPageChange={setPageSize}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          minHeight={200}
          paginationText={({ from, to, totalRecords }) =>
            `Showing  ${from} to ${to} of ${totalRecords} entries`
          }
        />
      </div>
    </div>
  );
};

export default ComponentsDatatablesDoucument;
