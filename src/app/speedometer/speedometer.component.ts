import * as d3 from 'd3';
import { Component, Input } from '@angular/core';

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

export interface GaugeConfig {
  series: GaugeSeries[];
  value: number;
}

@Component({
  selector: 'app-speedometer',
  templateUrl: './speedometer.component.html',
  styleUrls: ['./speedometer.component.css']
})
export class SpeedometerComponent  {

  private readonly BORDER_PX = 18;
  private readonly ARROW_HEADER_MARGIN = 5;
  private readonly FROM_RADIAN = -0.70;
  private readonly TO_RADIAN = 0.70;
  private readonly MARGIN = 0;

  private centerX: number;
  private centerY: number;
  private outerRadius: number;
  public config: GaugeConfig;

  @Input()
  width: number;

  @Input()
  height: number;

  @Input()
  public set data(config: GaugeConfig) {
    this.config = config;
    this.draw();
  }

  private getAngleByValue(value: number, startAngle: number): number {
    const firstSeries = Array.from(this.config.series).shift();
    const lastSeries = Array.from(this.config.series).pop();
    value = value - firstSeries.from;
    const fromToNumberRange = lastSeries?.to - firstSeries?.from;
    const onePercentage = (Math.abs(-0.7) + Math.abs(0.7)) / 100;
    let percentage = (value / fromToNumberRange) * 100;
    percentage = Math.min(percentage, 100);
    percentage = Math.max(percentage, 0);
    return (percentage * onePercentage * Math.PI) + startAngle - 0.05;
  }

  private draw(): void {
    if (!this.config) {
      return;
    }
    const labelPadding = 10;
    const config = this.config;
    const pi = Math.PI;
    const heightOrWidth = Math.min(this.width, this.height);
    const outerRadius = this.outerRadius = heightOrWidth / 2 - this.MARGIN;
    const innerRadius = outerRadius - this.BORDER_PX;
    const centerX = this.centerX = this.width / 2;
    const centerY = this.centerY = this.height / 2 + this.BORDER_PX;
    const translate = `translate(${centerX},${centerY})`;
    d3.select('#arc')
      .selectAll('svg')
      .remove();
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
      series.x = centerX + Math.cos(angle - 1.56) * (outerRadius + labelPadding);
      series.y = centerY + Math.sin(angle - 1.56) * (outerRadius + labelPadding);
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
          // .transition()
          // .duration(750)
          .attr('opacity', '1');
      })
      // tslint:disable-next-line:typedef
      .each(function(series) {
        const x1 = centerX;
        const y1 = centerY;
        const x2 = series.x;
        const y2 = series.y;
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
          // .transition()
          // .duration(1750)
          .attr('opacity', '1');
      });
    this.drawArrow(svg);
  }

  private getXByAngle(angle: number, margin: number, offset = -1.56): number {
    return this.centerX + Math.cos(angle + offset) * (this.outerRadius - margin);
  }

  private getYByAngle(angle: number, margin: number, offset = -1.56): number {
    return this.centerY + Math.sin(angle + offset) * (this.outerRadius - margin);
  }

  private drawArrow(svg): void {
    const arrowCircleRadius = 14 / 2;
    const arrowHeaderMargin = this.BORDER_PX + this.ARROW_HEADER_MARGIN;
    const cursorAngle = this.getAngleByValue(this.config.value, -2.04);

    const topX = this.getXByAngle(cursorAngle, arrowHeaderMargin, -1.66);
    const topY = this.getYByAngle(cursorAngle, arrowHeaderMargin, -1.66);

    const leftAngle = cursorAngle - 1.5;
    const rightAngle = cursorAngle + 1.5;
    const margin = this.outerRadius - arrowCircleRadius * 0.56;
    const path = [
      [topX, topY],
      [
        this.getXByAngle(leftAngle, margin),
        this.getYByAngle(leftAngle, margin),
      ],
      [
        this.getXByAngle(rightAngle, margin),
        this.getYByAngle(rightAngle, margin),
      ]
    ];
    const points = path
      .map(item => `${item[0]},${item[1]}`)
      .join(' ');
    svg
      .append('polygon')
      .attr('points', points)
      .attr('fill', '#ff4013');
    svg
      .append('circle')
      .attr('cx', this.centerX)
      .attr('cy', this.centerY)
      .attr('r', arrowCircleRadius)
      .attr('fill', '#ff4013');
  }

}
