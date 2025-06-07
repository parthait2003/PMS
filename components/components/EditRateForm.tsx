"use client"

import { useState } from "react"
import { useRouter } from "next/navigation";

interface EditRateFormProps {
    id: string;
    basecountry: string;
    foreigncurrency: string;
    fromcountry: string;
    tocountry: string;
    ratecurrency: string;
    transfertype: string;
    status: string;
    unit: string;
  }
export default function EditRateForm({id,basecountry,foreigncurrency,fromcountry,tocountry,ratecurrency,transfertype,status,unit}:EditRateFormProps) {
     const [newbasecountry,setNewbasecountry]= useState(basecountry);
     const [newforeigncurrency,setNewforeigncurrency]= useState(foreigncurrency);
     const [newfromcountry,setNewfromcountry]= useState(fromcountry);
     const [newtocountry,setNewtocountry]= useState(tocountry);
     const [newratecurrency,setNewratecurrency]= useState(ratecurrency);
     const [newtransfertype,setNewtransfertype]= useState(transfertype);
     const [newstatus,setNewstatus]= useState(status);
     const [newunit,setNewunit]= useState(unit);


    const router=useRouter()

     const handleSubmit = async (e:any)=>{
        e.preventDefault();

        try {
            const res = await fetch(`http://localhost:3000/api/rate/${id}`,{
                method:"PUT",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({newbasecountry, newforeigncurrency, newfromcountry, newtocountry, newratecurrency, newtransfertype, newstatus, newunit }),
            });



            if(!res.ok){
                throw new Error("failed to update product:");
            }

            router.refresh();
            router.push("/rate");
        }catch(error){
            console.log(error)
        }

     };

  return (
  <>
    <div className="mb-5">
     
      <form className="space-x-5-y-5" onSubmit={handleSubmit}>
       <label htmlFor="groupLname">Base Country</label>
        <input type="text" 
        value={newbasecountry} 
        placeholder="Base country" 
        className="form-select text-white-dark" 
        onChange={(e) =>setNewbasecountry(e.target.value)}/>

         <label htmlFor="groupLname">Foreign Currency</label>
        <input type="text" 
        value={newforeigncurrency} 
        placeholder="Foreign Currency" 
        className="form-select text-white-dark" 
        onChange={(e) =>setNewforeigncurrency(e.target.value)}/>

       <label htmlFor="groupLname">From Country</label>
        <input type="text" 
        value={newfromcountry} 
        placeholder="From Country" 
        className="form-select text-white-dark" 
        onChange={(e) =>setNewfromcountry(e.target.value)}/>
        
        <label htmlFor="groupLname">To Country</label>
        <input type="text" 
        value={newtocountry} 
        placeholder= "To Country" 
        className="form-select text-white-dark" 
        onChange={(e) =>setNewtocountry(e.target.value)}/>

        <label htmlFor="groupLname">Rate Currency</label>
        <input type="text" 
        value={newratecurrency} 
        placeholder="Rate Currency" 
        className="form-select text-white-dark" 
        onChange={(e) =>setNewratecurrency(e.target.value)}/>

        <label htmlFor="groupLname">Transfer Type</label>
        <input type="text" 
        value={newtransfertype} 
        placeholder="Transfer Type" 
        className="form-select text-white-dark" 
        onChange={(e) =>setNewtransfertype(e.target.value)}/>

        <label htmlFor="groupLname">Status</label>
        <input type="text" 
        value={newstatus} 
        placeholder="Status" 
        className="form-select text-white-dark" 
        onChange={(e) =>setNewstatus(e.target.value)}/>

        <label htmlFor="groupLname">Unit</label>
        <input type="text" 
        value={newunit} 
        placeholder="Unit" 
        className="form-select text-white-dark" 
        onChange={(e) =>setNewunit(e.target.value)}/>


        <button type="submit" className="btn btn-primary !mt-6">Update product</button>
      </form>
 
    </div>
    </>


  )
}

