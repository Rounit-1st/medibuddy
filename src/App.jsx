import { useState } from 'react'
import './App.css'
import Search from './components/Search'


function App() {
  // const [count, setCount] = useState(0)
  const [brand, setBrand] = useState("");
  const [manu, setMan] = useState("");
  const [pt, setPt] = useState("");
  const [route, setRoute] = useState("");
  const [data, setData] = useState("");
  const [error, setError] = useState(1);
  const [searched, setSearched] = useState(0);
  

async function fetchResult(input){
  const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${input}"&limit=20` 
  // const url = "https://api.fda.gov/drug/label.json?search=openfda.brand_name:advil&limit=20"
  const res = await fetch(url)
  res.json().then((data)=>{
    console.log(data);
    data.forEach(()=>{
      
    })
    return data
    
  })
}

  return (
    <>
      <Search search={fetchResult}/>
      {searched? "An error occured":<Result/>}
    </>
  )
}

export default App;



function Result(props){
  return (
    <div style={{display:"flex", flexDirection:"column", margin:"40px",textAlign:"center"}}>
          <label htmlFor="">Brand Name: {props.brand}</label>
      
          {/* <br /> */}
          <label htmlFor="">Generic Brand: {props.brand} </label>
          <label htmlFor="">Manufacturer : {props.manu}</label>
          <label htmlFor="">Product type : {props.pt}</label>
          <label htmlFor="">Route : {props.route}</label>
          <label htmlFor="">Data : {props.data}</label>
    </div>
  )
}

