import { use, useState } from "react"

// const URL = "https://api.fda.gov/drug/label.json?search=openfda.brand_name:"SEARCH_INPUT"&limit=20"

export default function Search(props) {
    const [query, setQuery] = useState("");
    return (
        <div className="search-container">
        <input type="text" placeholder="Search..." onChange={(e)=>{setQuery(e.target.value)}} />
        <button onClick={()=>props.search(query)}>Search</button>
        </div>
    )
}
