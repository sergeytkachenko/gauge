import * as d3 from 'd3';
import {Component, Input, OnInit} from '@angular/core';

interface GaugeSeries {
  color: string;
  from: number;
  to: number;
  startAngle?: number;
  endAngle?: number;
}

interface GaugeConfig {
  series: GaugeSeries[];
  value: number;
}

@Component({
  selector: 'app-speedometer',
  templateUrl: './speedometer.component.html',
  styleUrls: ['./speedometer.component.css']
})
export class SpeedometerComponent implements OnInit {

  private readonly BORDER_PX = 18;
  private readonly FROM_RADIAN = 1.3;
  private readonly TO_RADIAN = 2.7;
  private readonly MARGIN = 0;

  @Input()
  width: number;

  @Input()
  height: number;

  public config: GaugeConfig;

  constructor() { }

  ngOnInit(): void {
    this.config = {
      series: [
        {
          color: '#ff4013',
          from: 60,
          to: 100,
        },
        {
          color: '#e1e1e1',
          from: 100,
          to: 200,
        },
        {
          color: '#eeeeee',
          from: 200,
          to: 230,
        },
        {
          color: '#b6b400',
          from: 230,
          to: 280,
        },
      ],
      value: 320,
    };
    this.draw();
  }

  private draw(): void {
    const config = this.config;
    const pi = 3.14;
    const heightOrWidth = Math.min(this.width, this.height);
    const outerRadius = heightOrWidth / 2 - this.MARGIN;
    const innerRadius = outerRadius - this.BORDER_PX;
    const translateX = this.width / 2;
    const translateY = this.height / 2 + this.BORDER_PX;
    const translate = `translate(${translateX},${translateY})`;
    const svg = d3.select('#arc')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);
    const firstSeries = Array.from(config.series).shift();
    const lastSeries = Array.from(config.series).pop();
    const fromToNumberRange = lastSeries?.to - firstSeries?.from;
    const onePercentage = (this.TO_RADIAN - this.FROM_RADIAN) / 100;
    config.series.forEach((series, index) => {
      const prevSeries = config.series[index - 1];
      const startAngle = prevSeries ? prevSeries.endAngle : (this.FROM_RADIAN) * pi;
      const localRange = series.to - series.from;
      const percentage = (localRange / fromToNumberRange) * 100;
      const endAngle = (percentage * onePercentage * pi) + startAngle;
      series.startAngle = startAngle;
      series.endAngle = endAngle;
      svg
        .append('path')
        .attr('transform', translate)
        .attr('d', d3.arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius)
          .startAngle(startAngle)
          .endAngle(endAngle)
        )
        .attr('fill', series.color);
    });
  }

}
