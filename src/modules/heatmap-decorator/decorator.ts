/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
import { Id64String } from "@itwin/core-bentley";
import {
  DecorateContext,
  Decorator,
  IModelApp,
  IModelConnection,
} from "@itwin/core-frontend";
import { Point3d } from "@itwin/core-geometry";
import { heatmapMarker } from "./marker";

export interface HeatmapElement {
  title: string;
  position: Point3d;
}

/** A Decorator can be registered with ViewManager.addDecorator. Once registered, the decorate method will be called
 *  with a supplied DecorateContext. The Decorator will create markers for each element of interest and add them the the supplied context.
 */
export class heatmapDecorator implements Decorator {
  private _markers: heatmapMarker[] = [];

  private _createMarker = (
    element: HeatmapElement,
    image: HTMLImageElement,
    iModel: IModelConnection,
    pos: Point3d
  ) => {

    this._markers.push(
      new heatmapMarker(image, element.title, ()=>{} , pos)
    );
  };

  constructor(
    elements: HeatmapElement[],
    image: HTMLImageElement,
    iModel: IModelConnection
  ) {
    elements.forEach((element) => {
      this._createMarker(element, image, iModel, element?.position);
    });
  }

  /** Implement this method to add Decorations into the supplied DecorateContext. */
  public decorate = (context: DecorateContext) => {
    /* This method is called for every rendering frame. */
    if (context.viewport.view.isSpatialView()) {
      this._markers.forEach((marker) => marker.addDecoration(context));
    }
  };
}
