"use client";

import { useRouter } from "next/navigation";

export default async function RemoveBtn({id}){
    const router = useRouter();

    const RemoveRate = async ()=>{
        const confirmed = confirm("Are you sure?");
        
        if(confirmed){
            const res = await fetch(`http://localhost:3000/api/rate/${id}`,{
                method:"DELETE",
            });

            if(res.ok){
                router.refresh();
            }

        }

    };

    return(
        <button onClick={RemoveRate} className="btn btn-error ml-2">
            DELETE
        </button>
    );

}