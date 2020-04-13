import React, { useState, useEffect } from "react";
import Map from "./components/map";
import Counter from "./components/counter";
import DeepDive from './components/ChartAll';
import axios from "axios";

function App() {
  const [districts, setDistricts] = useState({});
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (fetched === false) {
      axios
        .get("data")
        .then(response => {
          setDistricts(response.data.Assam);
          setFetched(true);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }, [fetched]);

  return (
    <div className="flex bg-fiord-100 min-h-screen min-w-full justify-center">
      {!fetched && <div className="spinner min-h-screen min-w-full"></div>}
      {fetched && (
        <div className="flex-1 flex-col p-5 font-inter text-black overflow-hidden antialiased">
          <div className="flex flex-col avg:flex-row">
            <div className="flex-none avg:pr-2 avg:mr-auto mb-2 avg:mb-0">
              <p className="font-extrabold  text-2xl sm:text-2xl md:text-3xl lg:text-4xl avg:text-5xl text-center avg:text-left">
                ASSAM COVID-19 TRACKER
              </p>
              <p className="text-sm text-center avg:text-left">
                (Data Collected From https://covid19.assam.gov.in)
              </p>
            </div>
            <div className="flex flex-col pl-0 avg:pl-2">
              <Counter districts={districts} />
            </div>
          </div>
          <div className="flex flex-col avg:flex-row mt-2">
            <div className="flex flex-col pl-0 avg:pl-2 avg:w-2/3">
              <Map districts={districts} />
            </div>
            <div className="flex-none avg:pr-2 avg:mr-auto mb-2 avg:mb-0">
              <p className="font-bold  text-2xl text-center avg:text-left">
                Charts
              </p>
              <p className="text-sm text-center avg:text-left"> (Data Collected From https://api.covid19india.org/)
              </p>
            </div>
            <div className="flex flex-col order-last avg:order-first pr-0 avg:pr-2 avg:w-1/3">
            <DeepDive />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
