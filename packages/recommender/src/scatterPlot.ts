import * as SandDance from "@msrvida/sanddance";
import { Recommender, Recommendation, Rule } from './recommender';

const minDistinctVal = 10;

export class ScatterPlotRecommenderSummary {
    public best: Recommendation;
    //all columns
    constructor(columns: SandDance.types.Column[], data: object[]) {
        let score = -1;
        for (let i = 0; i < columns.length; i++) {
            for (let j = i + 1; j < columns.length; j++) {
                let axes = [];
                axes.push(columns[i]);
                axes.push(columns[j]);
                let recommendation = new ScatterPlotRecommender(axes, data).recommend();
                if (recommendation.score > score) {
                    this.best = recommendation;
                    score = recommendation.score;
                }
                if(score===3) break;
            };
            if(score===3) break;
        }

        for (let k = 0; k < columns.length; k++) {
            if(columns[k]===this.best.x || columns[k]===this.best.y ) continue;
            if(columns[k].quantitative || columns[k].stats.distinctValueCount<5) {
                this.best.colorBy = columns[k];
                break;
            }
        }

    }

    recommend() {
        return this.best;
    }

}

export class ScatterPlotRecommender implements Recommender {
    public rules: Rule[];
    public columns: SandDance.types.Column[];
    public score: number;

    constructor(columns: SandDance.types.Column[], data: object[]) {
        this.score = 0;
        this.columns = columns;
        //total score of 3
        this.rules = [
            //If both axes are numerical, return true
            (columns) => {
                if (columns[0].quantitative && columns[1].quantitative) {
                    return true;
                } else {
                    return false;
                }

            },
            //x-axis distinct value>10
            (columns) => {
                if (columns[0].stats.distinctValueCount > minDistinctVal) {
                    return true;
                } else {
                    return false;
                }
            },
            //y-axis distinct value>10
            (columns) => {
                if (columns[1].stats.distinctValueCount > minDistinctVal) {
                    return true;
                } else {
                    return false;
                }
            }

        ];
        for (let i = 0; i < this.rules.length; i++) {
            if (this.rules[i](columns)) this.score++;
        }

    }

    recommend() {
        let rec: Recommendation = {
            type: 'scatterplot',
            x: this.columns[0],
            y: this.columns[1],
            score: this.score,
            sizeBy: undefined,
            colorBy: undefined
        }
        return rec;
    }

}