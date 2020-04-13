import React, {useState, useEffect} from 'react';
import axios from 'axios';
import AgeChart from './Charts/agechart';
import AllStatesChart from './Charts/allstates';
import TotalConfirmedChart from './Charts/totalconfirmedchart';
import DailyConfirmedChart from './Charts/dailyconfirmedchart';

function ChartAll(props) {
  const [fetched, setFetched] = useState(false);
  const [timeseries, setTimeseries] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [statesTimeSeries, setStatesTimeSeries] = useState([]);

  useEffect(() => {
    if (fetched === false) {
      getStates();
    }
  }, [fetched]);

  const getStates = async () => {
    try {
      const [
        response,
        rawDataResponse,
        stateDailyResponse,
      ] = await Promise.all([
        axios.get('https://api.covid19india.org/data.json'),
        axios.get('https://api.covid19india.org/raw_data.json'),
        axios.get('https://api.covid19india.org/states_daily.json'),
      ]);
      setTimeseries(response.data.cases_time_series);
      setStatesTimeSeries(stateDailyResponse.data.states_daily);
      setRawData(rawDataResponse.data.raw_data);
      setFetched(true);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex-1 relative rounded-lg p-4 bg-fiord-500 mb-4 avg:mb-0 min-w-full">
        <div class="bg-gray-100 rounded-lg p-4 text-center mb-2">
         <div className="flex-1 w-full " >
          <TotalConfirmedChart
            title="Total Cases in India"
            timeseries={timeseries} 
          />
        </div>

        <div className="flex-1 w-full">
          <DailyConfirmedChart
            title="Daily Cases in India"
            timeseries={timeseries}
          />
        </div>
        </div>
        <div class="bg-gray-100 rounded-lg p-4 text-center mb-2">
        <div className="flex-1 w-full" >
          <AllStatesChart
            title="Top 5 States (Total Cases)"
            data={statesTimeSeries}
          />
        </div>

        <div className="flex-1 w-full">
          <AgeChart title="Age Group of Patients" data={rawData} />
        </div>
      </div>
      </div>
  );
}

export default ChartAll;
