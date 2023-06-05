import featureCollection from '../../feature-collection.json';

// Reduce properties, only a few is needed for this test/poc.
const propertyKeys = ['name', 'pop_est', 'pop_year', 'economy', 'income_grp', 'iso_a3', 'continent', 'subregion', 'region_wb'];

const features = featureCollection.features.reduce((accumulator, current) => {
    const properties = {};

    propertyKeys.forEach((key, index) => {
        if (key in current.properties) {
            properties[key] = current.properties[key];
        }
    });
    accumulator.push({ type: current.type, geometry: current.geometry, properties });

    return accumulator;
}, []);

// Reusable constants in the configuration.
const sourceId = 'states';
const fillColor = '#627BC1';

export const HungerMapConfiguration= {

    accessToken: 'pk.eyJ1IjoiamFuLWtsZW1tZW5zZW4iLCJhIjoiY2xpZnh2MGd6MWV0bTNmcW9wc3YzYXEycCJ9.aBBa9hFtrfPCurmizlKjpw',

    initialViewState: {
        latitude: 5.378994,
        longitude: 16.746541,
        zoom: 2.75
    },

    mapSettings: {
        scrollZoom: true,
        boxZoom: true,
        dragRotate: true,
        dragPan: true,
        keyboard: true,
        doubleClickZoom: false,
        touchZoomRotate: true,
        touchPitch: true,
        minZoom: 0,
        maxZoom: 20,
        minPitch: 0,
        maxPitch: 85
    },

    mapStyles: {
        width: '100vw',
        height: '92.5vh'
    },

    mapBoxStylesUrl: 'mapbox://styles/mapbox/dark-v9',

    source: {
        id: sourceId,
        config: {
            type: "geojson",
            data: {
                type: 'FeatureCollection',
                features: features
            },
            promoteId: 'iso_a3'
        }
    },
    layers: {
        stateFills: {
            id: 'state-fills',
            type: 'fill',
            source: sourceId,
            layout: {},
            paint: {
                'fill-color': fillColor,
                'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    0.6,
                    0.2
                ]
            }
        },
        stateFillsHighlighted: {
            id: 'state-fills-highlighted',
            type: 'fill',
            source: sourceId,
            paint: {
                'fill-color': fillColor,
                'fill-opacity': 0.6
            },
            filter: ['in', 'iso_a3', '']
        },
        stateLines: {
            id: 'state-lines',
            type: 'line',
            source: sourceId,
            paint: {
                'line-color': '#000',
                'line-width': 1,
                'line-opacity': 0.05,
            }
        }
    },

    apiPaths: {
        hazards: 'https://api.hungermapdata.org/v1/climate/hazards',
        integratedFoodSecurityPhaseClassification: 'https://api.hungermapdata.org/v1/ipc/peaks'
    }

}