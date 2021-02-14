import * as d3 from 'd3';
import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';

interface GaugeSeries {
  endAngleX?: number;
  endAngleY?: number;
  yAngle?: number;
  xAngle?: number;
  color: string;
  from: number;
  to: number;
  startAngle?: number;
  endAngle?: number;
  startAngleX?: number;
  startAngleY?: number;
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
export class SpeedometerComponent implements AfterViewInit  {
  @ViewChild('chart')
  private chartRef: ElementRef;
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

  ngAfterViewInit(): void {
    // tslint:disable-next-line:no-unused-expressi
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
    if (!this.config || !this.chartRef?.nativeElement) {
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
    const svg = d3.select(this.chartRef.nativeElement)
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
      series.xAngle = Math.cos(series.startAngle - 1.56);
      series.yAngle = Math.sin(series.startAngle - 1.56);
      series.endAngleX = centerX + Math.cos(series.endAngle - 1.56) * (outerRadius + labelPadding);
      series.endAngleY = centerY + Math.sin(series.endAngle - 1.56) * (outerRadius + labelPadding);

      series.startAngleX = centerX + Math.cos(series.startAngle - 1.56) * (outerRadius + labelPadding);
      series.startAngleY = centerY + Math.sin(series.startAngle - 1.56) * (outerRadius + labelPadding);
    });
    const seriesWithLabels = config.series.map(series => {
      const text = series.from;
      const textTranslateX = series.startAngle < 0
        ? -(text.toString().length * 9)
        : 0;
      const labels = [
        {
          x1: centerX,
          y1: centerY,
          x2: series.startAngleX,
          y2: series.startAngleY,
          text,
          textTranslateX,
        }
      ];
      return {
        labels,
        ...series,
      };
    });
    svg
      .selectAll('*')
      .remove();
    svg
      .selectAll('path')
      .data(seriesWithLabels)
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
      });
    svg
      .selectAll('line')
      .data(seriesWithLabels)
      .enter()
      .append('line')
      .attr('x1', d => d.labels[0].x1)
      .attr('y1', d => d.labels[0].y1)
      .attr('x2', d => d.labels[0].x2)
      .attr('y2', d => d.labels[0].y2)
      .attr('opacity', 0)
      .attr('stroke', '#ccc');
      // tslint:disable-next-line:typedef
    svg
      .selectAll('text.label')
      .data(seriesWithLabels)
      .enter()
      .append('text')
      .text(d => d.labels[0].text)
      .attr('class', 'label')
      .attr('x', d => d.labels[0].x2)
      .attr('y', d => d.labels[0].y2)
      .style('fill', 'red')
      .style('font-size', '12px')
      .style('font-family', 'Lexend Mega')
      .attr('transform', d => `translate(${d.labels[0].textTranslateX}, 0)`);
    /*
      .each(function(series, index) {
        const labels = series.labels || [];
        labels.forEach(label => {
          d3.select(this)
            .append('line')
            .attr('x1', label.x1)
            .attr('y1', label.y1)
            .attr('x2', label.x2)
            .attr('y2', label.y2)
            .attr('opacity', 0)
            .attr('stroke', '#ccc');
          // add labels
          d3.select(this)
            .append('text')
            .text(label.text)
            .attr('x', label.x2)
            .attr('y', label.y2)
            .style('fill', 'red')
            .style('font-size', '12px')
            .style('font-family', 'Lexend Mega')
            .attr('transform', `translate(${label.textTranslateX}, 0)`);
          // .attr('opacity', '0')
          // .transition()
          // .duration(1750)
          // .attr('opacity', '1');
        });
      });
      */
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
    const polygonPoints = path
      .map(item => `${item[0]},${item[1]}`)
      .join(' ');
    svg
      .selectAll('polygon.arrow')
      .data([polygonPoints])
      .enter()
      .append('polygon')
      .attr('class', 'arrow')
      .attr('points', d => d)
      .attr('fill', '#ff4013');
    svg
      .selectAll('circle.arrow')
      .data([
        {
          cx: this.centerX,
          cy: this.centerY,
          r: arrowCircleRadius,
        }
      ])
      .enter()
      .append('circle')
      .attr('class', 'arrow')
      .attr('cx', d => d.cx)
      .attr('cy', d => d.cy)
      .attr('r', d => d.r)
      .attr('fill', '#ff4013');
  }

}
