import React from 'react';

import { Bar } from 'react-chartjs-2';

const BOOKINGS_BUCKETS = {
    Cheap: {
        min: 0,
        max: 49
    },
    Normal: {
        min: 50,
        max: 99
    },
    Expensive: {
        min: 100,
        max: 1000000
    }
};

const bookingsChart = props => {
    let chartData = {labels:[], datasets: []};
    let values = [];
    for(const bucket in BOOKINGS_BUCKETS) {
        const filteredBookingsCount = props.bookings.reduce((prev, current) => {
            if(
                current.event.price > BOOKINGS_BUCKETS[bucket].min &&
                current.event.price < BOOKINGS_BUCKETS[bucket].max
            ) {
                return prev + 1;
            }
            else {
                return prev;
            }
        }, 0);
        values.push(filteredBookingsCount)
        chartData.labels.push(bucket);
        chartData.datasets.push({
            fillcolor: "rgba(220, 220, 220, 0.5)",
            strokeColor: "rgba(220, 220, 220, 0.8)",
            highlightColor: "rgba(220, 220, 220, 0.8)",
            highlightStroke: "rgba(220, 220, 220, 0.8)",
            data: values
        });
        values = [...values];
        values[values.length - 1] = 0;
    }
    return (
        <Bar 
            data={chartData} 
            width={125}
            height={200}
            options={{ maintainAspectRatio: false }}
        />
    );
}

export default bookingsChart;