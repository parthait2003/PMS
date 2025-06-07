import EditRateForm from "@/components/components/EditRateForm";

const getRateById = async (id:any) => {
    try {
        const url = "http://localhost:3000/api/rate/" + id;
        const res = await fetch(url, {
            cache: "no-store",
        });

        if (!res.ok) {
            throw new Error("Failed to fetch rate");
        }

        return res.json();
    } catch (error) {
        console.error("Error fetching rate:", error);
        return null; 
    } 
};

export default async function EditRate({ params }:any) {
    const { id } = params;

    try {
        const rateData = await getRateById(id);
        
        if (!rateData) {
            return <div>Error: Failed to fetch rate</div>;
        }

        const { basecountry, foreigncurrency, fromcountry, tocountry, ratecurrency, transfertype, status, unit } = rateData;

        return (
            <EditRateForm
                id={id}
                basecountry={basecountry}
                foreigncurrency={foreigncurrency}
                fromcountry={fromcountry}
                tocountry={tocountry}
                ratecurrency={ratecurrency}
                transfertype={transfertype}
                status={status}
                unit={unit}
            />
        );
    } catch (error) {
        console.error("Error fetching rate:", error);
        return <div>Error: Failed to fetch rate</div>;
    }
}
