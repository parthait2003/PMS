"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import RemoveBtn from "@/components/components/RemoveBtn";

const getRates = async () => {
  try {
    const res = await fetch("http://localhost:3000/api/rate", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch rates");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching rates:", error);
    return { rates: [] };
  }
};

export default function Rate() {
  const [rates, setRates] = useState([]);

  useEffect(() => {
    const fetchRates = async () => {
      const { rates } = await getRates();
      setRates(rates);
    };

    fetchRates();
  }, []);

  return (
    <>
      <div>
        <Link href="/addrate">
          <button className="btn btn-primary">ADD RATE</button>
        </Link>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>
              <label>
                <input type="checkbox" className="checkbox" />
              </label>
            </th>
            <th>basecountry</th>
            <th>foreigncurrency</th>
            <th>fromcountry</th>
            <th>tocountry</th>
            <th>ratecurrency</th>
            <th>transfertype</th>
            <th>status</th>
            <th>unit</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((rs) => (
            <tr className="hover" key={rs._id}>
              <td>
                <label>
                  <input type="checkbox" className="checkbox" />
                </label>
              </td>
              <td>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="mask mask-squircle w-12 h-12"></div>
                  </div>
                  <div>
                    <div className="font-bold">{rs.basecountry}</div>
                  </div>
                </div>
              </td>
              <td>{rs.foreigncurrency}</td>
              <td>{rs.fromcountry}</td>
              <td>{rs.tocountry}</td>
              <td>{rs.ratecurrency}</td>
              <td>{rs.transfertype}</td>
              <td>{rs.status}</td>
              <td>{rs.unit}</td>
              <td>
                <Link href={`/editrate/${rs._id}`}>
                  <button className="btn btn-primary">Edit</button>
                </Link>
                
                <RemoveBtn id={rs._id}/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}