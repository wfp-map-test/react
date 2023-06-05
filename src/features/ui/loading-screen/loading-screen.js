import React from 'react';
import styles from './loading-screen.module.css';

export const LoadingScreen = () => {

    return (
        <div className={styles.container}>
            <h3>Hang on please, We're loading data for you.</h3>
        </div>
    );

}
