import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";

import React, { useState, useMemo } from "react";
import MapExplorer from "../components/mapexplorer";

import axios from "axios";
import { MAP_META } from "../constants";

const Home: NextPage = () => {
  const [delegate, setDelegate] = useState(null);
  const [fetched, setFetched] = useState(false);

  useMemo(async () => {
    const { data } = await axios.get("./api/delegate");
    console.log(data);
    setDelegate(data);
    setFetched(true);
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Shan state d3-geo-map</title>
        <meta name="description" content="Shan state d3-geo-map" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Shan state <a href="https://d3js.org/">D3</a> geo-map
        </h1>
        <p className={styles.description}>
          Project repository{" "}
          <a href="https://github.com/NoerNova/shanstate_geo_maps">
            shanstate_geo_maps
          </a>
        </p>

        <div className={styles.map}>
          <React.Fragment>
            <div className={styles.mapContainer}>
              {fetched && (
                <React.Fragment>
                  <MapExplorer
                    mapMeta={MAP_META.Shan}
                    states={"shan"}
                    townshipDelegate={delegate}
                    isCountryLoaded={true}
                  />
                </React.Fragment>
              )}
            </div>
          </React.Fragment>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://noernova.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Made with ♥ NoerNova
        </a>
      </footer>
    </div>
  );
};

export default Home;
