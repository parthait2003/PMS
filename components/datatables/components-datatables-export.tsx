"use client";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState } from "react";
import sortBy from "lodash/sortBy";
import IconFile from "@/components/icon/icon-file";
import IconPrinter from "@/components/icon/icon-printer";
import IconPlus from "../icon/icon-plus";
import Link from "next/link";

const col1 = [
  "_id",
  "firstName",
  "lastName",
  "dob",
  "email",
  "country",
  "state",
  "city",
];

const ComponentsDatatablesExport = () => {
  const rowData = [
    {
      _id: "123456789",
      firstName: "John",
      lastName: "Doe",
      dob: "1990-05-15",
      email: "johndoe@example.com",
      country: "United States",
      state: "California",
      city: "Los Angeles",
    },
    {
      _id: "77890",
      firstName: "partha",
      lastName: "sarkar",
      dob: "1990-05-15",
      email: "johndoe@example.com",
      country: "United States",
      state: "California",
      city: "Los Angeles",
    },
  ];
  const [page, setPage] = useState(1);
  const [customerData, setCustomerData] = useState([]);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [initialRecords, setInitialRecords] = useState(
    sortBy(customerData, "lastName")
  );
  const [recordsData, setRecordsData] = useState(initialRecords);
  const [recordsDatasort, setRecordsDatashort] = useState("dsc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "_id",
    direction: "asc",
  });

  interface Customer {
    _id: string;
    firstName: string;
    lastName: string;
    mobile: string;
    dob: string;
    email: string;
    country: string;
    state: string;
    city: string;
  }

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    const fetchCustomerData = async () => {
      try {
        const response = await fetch("/api/customer"); // Assuming API endpoint is relative
        if (!response.ok) {
          throw new Error("Failed to fetch customer data");
        }
        const data = await response.json();

        const formattedCustomers = data.customer.map((customer: Customer) => ({
          _id: customer._id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          mobile: customer.mobile,
          dob: customer.dob,
          email: customer.email,
          country: customer.country,
          state: customer.state,
          city: customer.city,
        }));
        if (recordsDatasort == "dsc") {
          setInitialRecords(formattedCustomers);
          setRecordsData([...initialRecords.slice(from, to)]);
        }
      } catch (error) {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [page, pageSize, initialRecords]);

  useEffect(() => {
    const data = sortBy(initialRecords, sortStatus.columnAccessor);
    setRecordsDatashort(sortStatus.direction);
    setInitialRecords(sortStatus.direction === "desc" ? data.reverse() : data);
  }, [sortStatus]);

  useEffect(() => {
    setInitialRecords(() => {
      return initialRecords.filter((item: any) => {
        return (
          item._id.toLowerCase().includes(search.toLowerCase()) ||
          item.firstName.toLowerCase().includes(search.toLowerCase()) ||
          item.lastName.toLowerCase().includes(search.toLowerCase()) ||
          item.dob.toLowerCase().includes(search.toLowerCase()) ||
          item.mobile.toLowerCase().includes(search.toLowerCase()) ||
          item.email.toLowerCase().includes(search.toLowerCase()) ||
          item.country
            .toString()
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          item.state.toLowerCase().includes(search.toLowerCase()) ||
          item.city.toLowerCase().includes(search.toLowerCase())
        );
      });
    });
  }, [search]);

  const exportTable = (type: any) => {
    let columns: any = col1;
    let records = initialRecords;
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
        console.log(JSON.stringify(item));
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
  return (
    <div className="panel mt-6">
      <h5 className="mb-5 text-lg font-semibold dark:text-white-light">
        Customer
      </h5>

      <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div className="flex flex-wrap items-center">
          <Link href={"/addcustomer"}>
            <button type="button" className="btn btn-primary my-5">
              {" "}
              <IconPlus className="ltr:mr-2 rtl:ml-2" />
              Add customer
            </button>{" "}
          </Link>
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
          records={initialRecords}
          columns={[
            { accessor: "_id", title: "Code", sortable: true },
            { accessor: "firstName", title: "First Name", sortable: true },
            { accessor: "lastName", title: "Last name", sortable: true },
            { accessor: "dob", title: "DOB", sortable: true },
            { accessor: "mobile", title: "Phone", sortable: true },
            { accessor: "email", sortable: true },
            { accessor: "country", title: "Country", sortable: true },
            { accessor: "state", title: "State", sortable: true },
            { accessor: "city", title: "City", sortable: true },
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

export default ComponentsDatatablesExport;
