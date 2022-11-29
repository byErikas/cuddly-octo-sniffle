/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
import { Id64String } from "@itwin/core-bentley";
import {
  DecorateContext,
  Decorator,
  IModelApp,
  IModelConnection,
  StandardViewId,
  OutputMessagePriority,
  NotifyMessageDetails
} from "@itwin/core-frontend";
import { Point2d, Point3d } from "@itwin/core-geometry";
import { isIPv4 } from "net";
import { heatmapMarker } from "./marker";

export interface HeatmapElement {
  id: Id64String,
  title: string;
  position: Point3d;
  viewOrientation: StandardViewId
}

/** A Decorator can be registered with ViewManager.addDecorator. Once registered, the decorate method will be called
 *  with a supplied DecorateContext. The Decorator will create markers for each element of interest and add them the the supplied context.
 */
export class heatmapDecorator implements Decorator {
  private _markers: heatmapMarker[] = [];

  private _zoomToElementCallback = (elementId: Id64String, viewOrientation: StandardViewId) => {
    const vp = IModelApp.viewManager.selectedView;
    if (vp !== undefined) {
      vp.saveViewUndo();
      vp.zoomToElements(elementId, { standardViewId: viewOrientation, animateFrustumChange: true })
    }
  }

  private _createMarker = (
    element: HeatmapElement,
    image: HTMLImageElement,
    iModel: IModelConnection,
    pos: Point3d
  ) => {

    const _onMouseButtonCallback = () => {
      this._zoomToElementCallback(element.id, element.viewOrientation);
      IModelApp.notifications.outputMessage(new NotifyMessageDetails(OutputMessagePriority.Info, "Zoomed in!"));
      var htmlElement = document.createElement("Issue");
      htmlElement.innerHTML = "<div style='width: fit-content;'><div style='text-align:center'>Thermal Bridges:</div><div style='text-align:center'><b>Allowed:</b> R=0,11(W/(m*K))</div>" +
        "<div style='text-align:center'><b>Current:</b> R=0,20(W/(m*K))<hr><div style='text-align:center'>Exceeding by: <b style='color: red;'>81%</b></div><div style='text-align:center'>(<b style='color:red'>Critical</b>, reconstruction mandatory)</div><hr>" +
        "<div style='text-align:center'>Suggested solution:</div><div style='text-align:center'><b>Add more insulation material</b>: <em>XPS</em></div><div style='text-align: center'><img style='width: 150px' src='foam.png'/></div><div style='text-align: center;'>125 cm x 60 cm x 3 cm</div></div>";

      var pointProps = new Point2d(200, 400);
      var offset = new Point2d(0, 0);
      setTimeout(() => {
        IModelApp.uiAdmin.showCard(htmlElement, "", undefined, pointProps, offset, () => { }, () => {
          IModelApp.uiAdmin.hideCard();
          IModelApp.viewManager.selectedView?.doUndo();
        });
        IModelApp.notifications.outputMessage(new NotifyMessageDetails(OutputMessagePriority.Info, "Click outside of the card to close it."));
      }, 500);
    };
    iModel.elements.getPlacements(element.id).then((placements) => {
      var elementCenter = placements[0].getWorldCorners().getCenter();
      this._markers.push(new heatmapMarker(image, element.title, _onMouseButtonCallback, elementCenter));
    });
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
      this._markers.forEach((marker) => {
        // const vp = context.viewport;

        // const frustumFrac = IModelApp.viewManager.selectedView
        //   ?.getFrustum()
        //   .getFraction();

        // // var size = (vp.pixelsPerInch / 10) / (frustumFrac || 1);

        // console.log(frustumFrac);

        // const maxSize = 500;
        // const inMin = 0.24;
        // const InMax = 0.0006;

        // var size = ((frustumFrac || 1) - inMin) * (maxSize - 10) / (InMax - inMin) + 10;

        // console.log(size);

        // // if
        // marker.size = new Point2d(size, size);

        // //   console.log(frustumFrac);
        // //   const frustumCalc = 10 / ((frustumFrac || 1));
        // //   marker.size = new Point2d(
        // //     frustumCalc,
        // //     frustumCalc
        // //   );
        marker.addDecoration(context);
      });
    }
  };
}
