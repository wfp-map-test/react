import * as React from 'react';
import styles from './drawer.module.css';
import {HungerMapConfiguration} from '../hunger-map-configuration';
import {PropertiesContext} from '../hunger-map';

export const Drawer = (props) => {

    const properties = React.useContext(PropertiesContext);
    const [ipcCollectionCache, setIpcCollectionCache] = React.useState(null);
    const [ipcForSelectedCountry, setIpcForSelectedCountry] = React.useState(null);

    const fetchData = React.useCallback(async () => {
        try {
            const ipcCollectionResponse = await (await fetch(HungerMapConfiguration.apiPaths.integratedFoodSecurityPhaseClassification)).json();

            // Cache response for later usage - Saves requests to server.
            setIpcCollectionCache(ipcCollectionResponse);

            // The actual IPC entry for this country.
            const ipcForSelectedCountry = ipcCollectionResponse.ipc_peaks.find(ipc => ipc.iso3 === properties.iso_a3);

            // Update state.
            setIpcForSelectedCountry(ipcForSelectedCountry ?? null);
        } catch (error) {
            console.error(error);
        }
    });

    React.useEffect(() => {
        if (properties) {
            if (ipcCollectionCache === null) {
                // Fetch fresh from server.
                fetchData().catch(console.error);
            } else {
                // Fetch from cached state.
                const ipcForSelectedCountry = ipcCollectionCache.ipc_peaks.find(ipc => ipc.iso3 === properties.iso_a3);
                setIpcForSelectedCountry(ipcForSelectedCountry ?? null);
            }
        } else {
            // Drawer is not open, no properties are yet available via the context provider.
        }
    });

    const renderProperties = () => {
        return Object.keys(properties).map((key, index) => {
            return <small key={index.toString()}>
                <b>{key}:</b> { properties[key] }
                <br />
            </small>
        })
    }

    const renderIpc = () => {
        if (ipcForSelectedCountry) {
            return Object.keys(ipcForSelectedCountry).map((key, index) => {
                return <small key={index.toString()}>
                    <b>{key}:</b> { ipcForSelectedCountry[key] }
                    <br />
                </small>
            })
        } else {
            return <p>No data available for { props.properties.name }</p>
        }
    }

    return <>
        {
            properties &&
            <div className={ `${ styles.drawer } ${ props.show && styles.open }` }>
                <div className={styles.header}>
                    <h2>Country: { properties.name }</h2>
                </div>
                <div className={styles.body}>

                    <h3>Properties</h3>
                    <br />
                    { renderProperties() }

                    <br /><hr /><br />

                    <h3>Integrated food security phase classification</h3>
                    <br />
                    { renderIpc() }

                </div>
            </div>
        }
    </>
}
