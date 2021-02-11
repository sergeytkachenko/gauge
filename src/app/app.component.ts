import {Component, OnInit} from '@angular/core';
import {GaugeConfig} from './speedometer/speedometer.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'speedometer';
  public value = 50;
  public config: GaugeConfig;

  ngOnInit(): void {
    setInterval(() => {
      this.value ++;
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
            to: 400,
          },
        ],
        value: this.value,
      };
    }, 2500);
  }
}
