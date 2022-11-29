/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
*--------------------------------------------------------------------------------------------*/
import { BeButton, BeButtonEvent, Marker } from "@itwin/core-frontend";
import { Point2d, Point3d } from "@itwin/core-geometry";

/** This class is used to display a clickable image at the location of an element in the model. */
export class heatmapMarker extends Marker {

  //Possibly retire the height element later, as the heat map could be of variable size? @Erikas
  private static _height = 155;
  private _onMouseButtonCallback: any;

  constructor(
    image: HTMLImageElement,
    title: string,
    onMouseButtonCallback: any,
    worldLocation: Point3d,
  ) {
    // Use the same height for all the markers, but preserve the aspect ratio from the image
    super(worldLocation, new Point2d(200, 200));
    this._onMouseButtonCallback = onMouseButtonCallback;
    this.title = title; // The title  will be shown as a tooltip when the user interacts with the marker
    this.setImage(image);
  }

  /** This method will be called when the user clicks on a marker */
  public onMouseButton(ev: BeButtonEvent): boolean {
    // We only process the event if it is a dataButton click from an up position
    if (BeButton.Data !== ev.button || !ev.isDown || !ev.viewport || !ev.viewport.view.isSpatialView())
      return true;
    this._onMouseButtonCallback();
    return true; // Signals the event has been processed
  }
}