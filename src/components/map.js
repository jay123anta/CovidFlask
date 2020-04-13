import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { legendColor } from "d3-svg-legend";
import * as topojson from "topojson";
import lang from "./lang";

function Map(props) {
  const districts = props.districts;
  const [district, setDistrict] = useState({});
  const [statistic, setStatistic] = useState({});
  const map = useRef(null);

  useEffect(() => {
    if (Object.keys(districts).length > 0 && map.current) {
      const first = Object.keys(districts)[0];
      setDistrict({
        name: first,
        ...districts[first]
      });
      let total = 0;
      let minConfirmed = 800000;
      let maxConfirmed = 0;
      for (const d in districts) {
        total += districts[d].Confirmed;
        if (districts[d].Confirmed < minConfirmed)
          minConfirmed = districts[d].Confirmed;
        if (districts[d].Confirmed > maxConfirmed)
          maxConfirmed = districts[d].Confirmed;
      }
      setStatistic({
        total: total,
        maxConfirmed: maxConfirmed,
        minConfirmed: minConfirmed
      });

      const svg = d3.select(map.current);

      const width = 700;
      const height = 700;

      const projection = d3
        .geoMercator()
        .center([94,26.5])
        .scale(2500)
        .translate([width / 2, height / 2]);

      const path = d3.geoPath(projection);

      // Colorbar
      const maxInterpolation = 0.8;

      function label({ i, genLength, generatedLabels }) {
        if (i === genLength - 1) {
          const n = Math.floor(generatedLabels[i]);
          return `${n}+`;
        } else {
          const n1 = Math.floor(generatedLabels[i]);
          const n2 = Math.floor(generatedLabels[i + 1]);
          return `${n1} - ${n2}`;
        }
      }

      const color = d3
        .scaleSequential(d3.interpolateReds)
        .domain([0, statistic.maxConfirmed / maxInterpolation]);

      svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", "translate(900,200)");

      const numCells = 6;
      const delta = Math.floor(statistic.maxConfirmed / (numCells - 1));
      const cells = Array.from(Array(numCells).keys()).map(i => i * delta);

      const legend = legendColor()
        .shapeWidth(20)
        .cells(cells)
        .titleWidth(2)
        .labels(label)
        .title("Confirmed Cases")
        .orient("vertical")
        .scale(color);

      svg.select(".legend").call(legend);

      const promises =  [d3.json("/assam.json")];

      Promise.all(promises).then(ready);

      function ready([assam]) {
        svg
          .append("g")
          .attr("class", "assam")
          .selectAll("path")
          .data(topojson.feature(assam, assam.objects.dist).features)
          .enter()
          .append("path")
          .attr("fill", function(d) {
            const n = districts[d.properties.district].Confirmed;
            return d3.interpolateReds(
              (d.confirmed =
                (n > 0) * 0.05 +
                (n / statistic.maxConfirmed) * maxInterpolation)
            );
          })
          .attr("d", path)
          .attr("pointer-events", "all")
          .on("mouseenter", d => {
            if (districts[d.properties.district]) {
              const current = d.properties.district;
              setDistrict({
                name: current,
                ...districts[current]
              });
            }
            const target = d3.event.target;
            d3.select(target.parentNode.appendChild(target))
              .attr("stroke", "#ff073a")
              .attr("stroke-width", 2);
          })
          .on("mouseleave", d => {
            const target = d3.event.target;
            d3.select(target).attr("stroke", "None");
          })
          .style("cursor", "pointer")
          .append("title")
          .text(function(d) {
            return (
              parseFloat(
                800 *
                  (parseInt(districts[d.properties.district].Confirmed) /
                    statistic.total)
              ).toFixed(2) +
              "% from " +
              d.properties.district
            );
          });

        svg
          .append("path")
          .attr("stroke", "#f70a05")
          .attr("fill", "none")
          .attr("stroke-width", 2)
          .attr("d", path(topojson.mesh(assam, assam.objects.dist)));
      }
    }
  }, [districts, statistic.maxConfirmed, statistic.total]);

  return (
      <div className="flex relative rounded-lg p-4 bg-fiord-500 mb-4 avg:mb-0 min-w-full">
      <svg className="z-0" id="chart" height="535" viewBox="0 0 1000 500"
  preserveAspectRatio="xMidYMid meet" ref={map}></svg>
      <div
        className="z-40 flex-col absolute top-50 left-50 text-left text-secondary text-xs md:text-base"
        style={{ pointerEvents: "none" }}
      >
        <div className="flex-col m-2 px-2 py-1 rounded-md text-secondary bg-gradient-r-fiord-700 font-semibold">
          <p className="text-base text-secondary lg:text-xl">{district.name}</p>
        </div>
        {Object.keys(lang)
          .slice(1)
          .map((k, i) => {
            return (
              <div className="flex-col m-2 px-2 py-1 rounded-md bg-gradient-r-fiord-700">
                <p>{lang[k]}</p>
                <p className="font-medium">{district[k]}</p>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default Map;
