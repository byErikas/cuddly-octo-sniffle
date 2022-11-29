/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
*--------------------------------------------------------------------------------------------*/
import { Id64String } from "@itwin/core-bentley";
import { DecorateContext, Decorator, IModelApp, IModelConnection, StandardViewId } from "@itwin/core-frontend";
import { marker } from "./marker";

export interface ElementOfInterest {
  id: Id64String,
  title: string,
  viewOrientation: StandardViewId
}

/** A Decorator can be registered with ViewManager.addDecorator. Once registered, the decorate method will be called
 *  with a supplied DecorateContext. The Decorator will create markers for each element of interest and add them the the supplied context.
 */
export class decorator implements Decorator {
  private _markers: marker[] = [];

  private _zoomToElementCallback = (elementId: Id64String, viewOrientation: StandardViewId) => {
    const vp = IModelApp.viewManager.selectedView;
    if (vp !== undefined)
      vp.zoomToElements(elementId, { standardViewId: viewOrientation, animateFrustumChange: true })
  }

  private _createMarker = (element: ElementOfInterest, image: HTMLImageElement, iModel: IModelConnection,) => {
    const _onMouseButtonCallback = () => this._zoomToElementCallback(element.id, element.viewOrientation);
    iModel.elements.getPlacements(element.id).then((placements) => {
      var elementCenter = placements[0].getWorldCorners().getCenter();

      this._markers.push(new marker(image, element.title, _onMouseButtonCallback, elementCenter));
    });
  }

  constructor(elements: ElementOfInterest[], image: HTMLImageElement, iModel: IModelConnection) {
    elements.forEach((element) => { this._createMarker(element, image, iModel) });
  }

  /** Implement this method to add Decorations into the supplied DecorateContext. */
  public decorate = (context: DecorateContext) => {
    /* This method is called for every rendering frame. */
    if (context.viewport.view.isSpatialView()) {
      this._markers.forEach(marker => marker.addDecoration(context));
    }
  }
}
