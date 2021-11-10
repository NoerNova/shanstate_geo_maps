import ChoroplethMap from "./choropleth";

import React, { useState, useMemo } from "react";

import { useLocalStorage } from "react-use";
import styles from "../styles/Home.module.css";

function MapExplorer({
  mapMeta,
  states,
  townshipDelegate,
  isCountryLoaded,
}: any) {
  const [selectedRegion, setSelectedRegion] = useState({});

  const [mapOption, setMapOption] = useLocalStorage("mapOption", "SNLD");

  const [statistic, currentMapData] = useMemo(() => {
    const dataTypes: string[] = [
      "SNLD",
      "NLD",
      "USDP",
      "SNDP",
      "WNP",
      "PNO",
      "TNP",
    ];
    const statistic = dataTypes.reduce((acc: any, party: string) => {
      acc[party] = { total: 0, max: 0 };
      return acc;
    }, {});

    let currentMapData = {};

    currentMapData = Object.keys(townshipDelegate).reduce(
      (acc: any, township: string) => {
        acc[township] = {};
        dataTypes.forEach((party) => {
          const typeCount = parseInt(
            townshipDelegate[township]["winParty"][party]
          );
          statistic[party].total += typeCount;
          if (typeCount > statistic[party].max) {
            statistic[party].max = typeCount;
          }
          acc[township][party] = typeCount;
        });
        return acc;
      },
      {}
    );

    return [statistic, currentMapData];
  }, [townshipDelegate]);

  return (
    <div
      className={styles.mapExplorer}
      style={{
        animationDelay: "1.5s",
      }}
    >
      <ChoroplethMap
        statistic={statistic}
        mapMeta={mapMeta}
        mapData={currentMapData}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        isCountryLoaded={isCountryLoaded}
        mapOption={mapOption}
      />
    </div>
  );
}

export default React.memo(MapExplorer);
