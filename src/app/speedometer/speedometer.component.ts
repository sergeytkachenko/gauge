import * as d3 from 'd3';
import {Component, Input, OnInit} from '@angular/core';

interface GaugeSeries {
  yAngle?: number;
  xAngle?: number;
  color: string;
  from: number;
  to: number;
  startAngle?: number;
  endAngle?: number;
  x?: number;
  y?: number;
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
  private readonly FROM_RADIAN = -0.70;
  private readonly TO_RADIAN = 0.70;
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
      value: 200,
    };
    this.draw();
  }

  private draw(): void {
    const labelPadding = 10;
    const config = this.config;
    const pi = Math.PI;
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
    const onePercentage = (Math.abs(this.FROM_RADIAN) + Math.abs(this.TO_RADIAN)) / 100;
    config.series.forEach((series, index) => {
      const prevSeries = config.series[index - 1];
      const startAngle = prevSeries ? prevSeries.endAngle : (this.FROM_RADIAN) * pi;
      const localRange = series.to - series.from;
      const percentage = (localRange / fromToNumberRange) * 100;
      const endAngle = (percentage * onePercentage * pi) + startAngle;
      series.startAngle = startAngle + 0.02;
      series.endAngle = endAngle;
      const angle = series.startAngle;
      series.xAngle = Math.cos(angle - 1.56);
      series.yAngle = Math.sin(angle - 1.56);
      series.x = translateX + Math.cos(angle - 1.56) * (outerRadius + labelPadding);
      series.y = translateY + Math.sin(angle - 1.56) * (outerRadius + labelPadding);
    });
    svg
      .selectAll('path')
      .data(config.series)
      .enter()
      // tslint:disable-next-line:typedef
      .each(function(series: GaugeSeries) {
        const d = d3.arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius)
          .startAngle(series.startAngle)
          .endAngle(series.endAngle);
        d3
          .select(this)
          .append('path')
          .attr('transform', translate)
          .attr('d', d)
          .attr('fill', series.color)
          .attr('opacity', '0')
          .transition()
          .duration(750)
          .attr('opacity', '1');
      })
      // tslint:disable-next-line:typedef
      .each(function(series) {
        const x1 = translateX;
        const y1 = translateY;
        const x2 = series.x;
        const y2 = series.y;
        console.log(series.xAngle, series.yAngle, series.startAngle);
        const text = series.from;
        const textTranslateX = series.startAngle < 0
          ? -(text.toString().length * 9)
          : 0;
        d3.select(this)
          .append('line')
          .attr('x1', x1)
          .attr('y1', y1)
          .attr('x2', x2)
          .attr('y2', y2)
          .attr('opacity', 0)
          .attr('stroke', '#ccc');
        d3.select(this)
          .append('text')
          .text(text)
          .attr('x', x2)
          .attr('y', y2)
          .style('fill', 'red')
          .style('font-size', '12px')
          .style('font-family', 'Lexend Mega')
          .attr('transform', `translate(${textTranslateX}, 0)`)
          .attr('opacity', '0')
          .transition()
          .duration(1750)
          .attr('opacity', '1');
      });
  }

}
