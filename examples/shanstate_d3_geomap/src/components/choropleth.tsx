import React, { useCallback, useEffect, useRef, useState } from "react";
import { MAP_TYPES } from "../constants";

import * as d3 from "d3";
import * as topojson from "topojson";

import styles from "../styles/Home.module.css";
const propertyFieldMap = {
  township: "TS",
};

function ChoroplethMap({
  statistic,
  mapData,
  mapMeta,
  selectedRegion,
  setSelectedRegion,
  isCountryLoaded,
  mapOption,
}: any) {
  const choroplethMap = useRef(null);
  const choroplethLegend = useRef(null);
  const [svgRenderCount, setSvgRenderCount] = useState(0);
  const [selectTownShip, setSelectTownShip] = useState("");

  const ready = useCallback(
    (geoData) => {
      d3.selectAll("svg#chart > *").remove();

      const propertyField = propertyFieldMap["township"];
      const svg = d3.select(choroplethMap.current);

      const topology = topojson.feature(
        geoData,
        geoData.objects[mapMeta.graphObjectName]
      );

      const projection = d3.geoMercator();

      // Set size of the map
      let path;
      let width;
      let height;
      if (!svg.attr("viewBox")) {
        const widthStyle = parseInt(svg.style("width"));
        if (isCountryLoaded) projection.fitWidth(widthStyle, topology);
        else {
          const heightStyle = parseInt(svg.style("height"));
          projection.fitSize([widthStyle, heightStyle], topology);
        }
        path = d3.geoPath(projection);
        const bBox = path.bounds(topology);
        width = +bBox[1][0];
        height = +bBox[1][1];
        svg.attr("viewBox", `0 0 ${width} ${height}`);
      }
      const bBox = svg.attr("viewBox").split(" ");
      width = +bBox[2];
      height = +bBox[3];
      projection.fitSize([width, height], topology);
      path = d3.geoPath(projection);

      const colorInterpolator = (t: number) => {
        switch (mapOption) {
          case "SNLD":
            return d3.interpolateReds(t * 0.85);
          case "NLD":
            return d3.interpolateBlues(t * 0.85);
          case "USDP":
            return d3.interpolateGreens(t * 0.85);
          case "SNDP":
            return d3.interpolateGreys(t * 0.85);
          case "WNP":
            return d3.interpolateGreys(t * 0.85);
          case "PNO":
            return d3.interpolateGreys(t * 0.85);
          case "TNP":
            return d3.interpolateGreys(t * 0.85);
          default:
            return;
        }
      };
      const colorScale = d3.scaleSequential(
        [0, Math.max(1, statistic[mapOption].max)],
        colorInterpolator
      );

      /* Draw map */
      let onceTouchedRegion = null;
      const g = svg.append("g").attr("class", mapMeta.graphObjectName);
      g.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(topology.features)
        .join("path")
        .attr("class", `path-region ${mapOption}`)
        .attr("fill", fillColor)
        .attr("d", path)
        .attr("pointer-events", "all")
        // .on("mouseenter", (d, i) => {
        //   handleMouseEnter(i.properties[propertyField]);
        // })
        // .on("mouseleave", (d) => {
        //   if (onceTouchedRegion === d) onceTouchedRegion = null;
        // })
        // .on("touchstart", (d) => {
        //   if (onceTouchedRegion === d) onceTouchedRegion = null;
        //   else onceTouchedRegion = d;
        // })
        .on("click", (d, i: any) => {
          handleClick(i.properties[propertyField]);
        })
        .style("cursor", "pointer")
        .append("title")
        .text(function (d: any) {
          const region = d.properties[propertyField];
          const value: number = mapData[region]
            ? mapData[region][mapOption]
            : 0;
          return toTitleCase(region);
        });

      g.append("path")
        .attr("class", "borders")
        .attr("stroke", "#888888")
        .attr("fill", "none")
        .attr("stroke-width", width / 250)
        .attr(
          "d",
          path(topojson.mesh(geoData, geoData.objects[mapMeta.graphObjectName]))
        );

      const handleMouseEnter = (name: string) => {
        try {
          setSelectedRegion(name);
          console.log(name);
        } catch (err) {
          console.log("err", err);
        }
      };

      const handleClick = (name: string) => {
        try {
          setSelectTownShip(name);
        } catch (err) {
          console.log("err", err);
        }
      };

      function getPartyColor(p: string) {
        switch (p) {
          case "SNLD":
            return "#FEF200";
          case "NLD":
            return "#E7332B";
          case "USDP":
            return "#02532D";
          case "SNDP":
            return "#009F3C";
          case "WNP":
            return "#282DEE";
          case "PNO":
            return "#1356B6";
          case "TNP":
            return "#01AEF0";
          default:
            return "#dddddd";
        }
      }

      function fillColor(d: any) {
        const region = d.properties[propertyField].toLowerCase();
        const n = mapData[region] ? mapData[region][mapOption] : 0;
        let sortable = [];
        for (let i in mapData[region]) {
          sortable.push([i, mapData[region][i]]);
        }

        sortable.sort(function (a, b) {
          if (isNaN(b[1])) {
            return isNaN(a[1]) - 1;
          } else {
            return b[1] - a[1];
          }
        });

        if (sortable.length > 0) {
          const color = !isNaN(sortable[0][1])
            ? getPartyColor(sortable[0][0])
            : getPartyColor("NaN");

          return color;
        }
      }

      // Reset on tapping outside map
      svg.attr("pointer-events", "auto").on("click", () => {
        if (mapMeta.mapType === MAP_TYPES.COUNTRY) {
          setSelectedRegion(null);
        }
      });
    },
    [mapMeta, statistic, mapOption, isCountryLoaded, mapData, setSelectedRegion]
  );

  const toTitleCase = (str: any) => {
    str = str.toLowerCase().split(" ");
    for (let i = 0; i < str.length; i++) {
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(" ");
  };

  useEffect(() => {
    (async () => {
      const data = await d3.json(mapMeta.geoDataFile);
      if (statistic && choroplethMap.current) {
        ready(data);
        setSvgRenderCount((prevCount) => prevCount + 1);
      }
    })();
  }, [mapMeta.geoDataFile, statistic, ready]);

  useEffect(() => {
    const highlightRegionInMap = (name: string) => {
      const paths = d3.selectAll(".path-region");
      paths.classed("map-hover", (d: any, i, nodes) => {
        const propertyField = propertyFieldMap["township"];
        if (name === d.properties[propertyField]) {
          nodes[i].parentNode.appendChild(nodes[i]);
          return true;
        }
        return false;
      });
    };
    highlightRegionInMap(selectedRegion);
  }, [svgRenderCount, selectedRegion]);

  return (
    <div className={styles.choroplethContainer}>
      <div className={styles.svgParent} style={{ animationDelay: "2.5s" }}>
        <svg
          id="chart"
          preserveAspectRatio="xMidYMid meet"
          ref={choroplethMap}
        ></svg>
      </div>
      <div className={styles.selectedTownship}>
        <h2>{selectTownShip}</h2>
      </div>
    </div>
  );
}

export default React.memo(ChoroplethMap);
