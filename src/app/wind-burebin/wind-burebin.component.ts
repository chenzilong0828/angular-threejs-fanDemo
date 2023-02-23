import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { WindTurebinService } from '../service/wind-turebin.service';
@Component({
  selector: 'app-wind-burebin',
  templateUrl: './wind-burebin.component.html',
  styleUrls: ['./wind-burebin.component.scss']
})
export class WindBurebinComponent implements OnInit {

  constructor(
    private windTurebineService: WindTurebinService
  ) { }

  ngOnInit(): void {
    THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);
  }

  ngAfterViewInit(): void {
    this.windTurebineService.init(false);
  }

}
