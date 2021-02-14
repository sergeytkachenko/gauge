import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import Chart from 'chart.js';

class Point {
}

@Component({
  selector: 'app-gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.css']
})
export class GaugeComponent implements AfterViewInit, OnInit {
  @ViewChild('chart')
  private chartRef: ElementRef;
  private chart: Chart;
  private readonly data: Point[];

  constructor() {
    this.data = [
      {x: 1, y: 5},
      {x: 2, y: 10},
      {x: 3, y: 6},
      {x: 4, y: 2},
      {x: 4.1, y: 6}
    ];
  }

  ngAfterViewInit(): void {
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'MyType',
      data: {
        datasets: [{
          label: 'Interesting Data',
          data: this.data,
          fill: false
        }]
      },
      options: {
        responsive: false,
        scales: {
          xAxes: [{
            type: 'linear'
          }],
        }
      }
    });
  }

  ngOnInit(): void {
    Chart.controllers.MyType = Chart.DatasetController.extend({
      // tslint:disable-next-line:typedef
      draw(ease) {},
    });
  }

}
