import * as React from 'react';
import Map from 'react-map-gl';
import bbox from '@turf/bbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// Components
import { Drawer } from './drawer/drawer';
import { LoadingScreen } from '../ui/loading-screen/loading-screen';

// Map configuration
import { HungerMapConfiguration } from './hunger-map-configuration';

// Styles
import './../../App.css';

// Create a Context - We might want to have multiple child components which can then all read from the same data / context.
export const PropertiesContext = React.createContext({ properties: null });

export const HungerMap = () => {

    const mapRef = React.useRef();
    const polygonHighLightOnHoverRef = React.useRef(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [mapSettings, setMapSettings] = React.useState(HungerMapConfiguration.mapSettings);
    const [properties, setProperties] = React.useState(null);
    const [showDrawer, setShowDrawer] = React.useState(false);

    // Pretend we are loading data for the application.
    // Show a spinner and some welcoming content for the users
    React.useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 1500);
    }, []);

    // Cache logic after the initial render - Here we set up the map source, layers and behaviours after it is loaded to DOM.
    const mapLoadedCallback = React.useCallback((event) => {

        const map = mapRef.current;
        const mapInstance = map.getMap();

        // Add source for GeoJson.
        mapInstance.addSource(HungerMapConfiguration.source.id, HungerMapConfiguration.source.config);

        // Add layers.
        mapInstance.addLayer(HungerMapConfiguration.layers.stateFills);
        mapInstance.addLayer(HungerMapConfiguration.layers.stateLines);
        mapInstance.addLayer(HungerMapConfiguration.layers.stateFillsHighlighted);

        // Highlight polygons on click - Layer is added by creating a small bounding box around the clicked area.
        map.on('click', (event) => {
            const bbox = [ [event.point.x - 5, event.point.y - 5], [event.point.x + 5, event.point.y + 5]];
            const features = map.queryRenderedFeatures(bbox, { layers: [HungerMapConfiguration.layers.stateFills.id] });
            const featuresByIsoA3Code = features.map((feature) => feature.properties.iso_a3);
            map.getMap().setFilter(HungerMapConfiguration.layers.stateFillsHighlighted.id, ['in', 'iso_a3', ...featuresByIsoA3Code]);
        });

        // Show Drawer component when a country / polygon is clicked.
        // And zoom the map in to fit the polygons bounding box.
        map.on('click', HungerMapConfiguration.layers.stateFills.id, (event) => {
            const properties = event.features[0].properties;

            // Save the feature properties to state, the 'PropertiesContext' is reading this value in our render logic.
            setProperties(properties);

            // The clicked feature.
            const feature = event.features[0];

            if (feature) {
                // Create a bounding box (by the help of "@turf/bbox").
                const [minLng, minLat, maxLng, maxLat] = bbox(feature);
                mapRef.current.fitBounds([ [minLng, minLat], [maxLng, maxLat] ], {
                    padding: 150,
                    duration: 1000
                });
            }

            // Show the drawer.
            if (!showDrawer) {
                setShowDrawer(true);
            }
        });

        // Mouse pointer and polygon hover effect.
        map.on('mousemove', HungerMapConfiguration.layers.stateFills.id, (event) => {
            map.getCanvas().style.cursor = 'pointer';
            if (event.features.length > 0) {
                if (polygonHighLightOnHoverRef !== null) {
                    map.setFeatureState({
                        source: HungerMapConfiguration.source.id,
                        id: polygonHighLightOnHoverRef.current
                    }, { hover: false } );
                }
                polygonHighLightOnHoverRef.current = event.features[0].id;
                map.setFeatureState({
                    source: HungerMapConfiguration.source.id,
                    id: polygonHighLightOnHoverRef.current
                }, { hover: true } );
            }
        });

        map.on('mouseleave', HungerMapConfiguration.layers.stateFills.id, (event) => {
            map.getCanvas().style.cursor = '';
            if (polygonHighLightOnHoverRef !== null) {
                map.setFeatureState(
                    { source: HungerMapConfiguration.source.id, id: polygonHighLightOnHoverRef.current },
                    { hover: false }
                );
            }
            polygonHighLightOnHoverRef.current = null;
        });

    }, [] );

    const hideDrawer = (event) => {
        if (showDrawer) {
            setShowDrawer(false);
        }
    }

    return (
        <>
            {
                isLoading ? <LoadingScreen /> : <>
                    <Map
                        ref={ mapRef }
                        { ...mapSettings }
                        mapboxAccessToken={ HungerMapConfiguration.accessToken }
                        initialViewState={ HungerMapConfiguration.initialViewState }
                        style={ HungerMapConfiguration.mapStyles }
                        mapStyle={ HungerMapConfiguration.mapBoxStylesUrl }
                        onClick={ hideDrawer }
                        onLoad={ mapLoadedCallback }
                    >
                    </Map>
                    // Our context - This is to prepare for multiple child components, which can then all use from the same source of data
                    <PropertiesContext.Provider value={properties}>
                        <Drawer show={ showDrawer } properties={ properties } />
                    </PropertiesContext.Provider>
                </>
            }
        </>
    );
}
