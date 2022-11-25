/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { RenderMode, ViewFlagsProperties } from "@itwin/core-common";
import { Viewport, ViewState3d } from "@itwin/core-frontend";

export type ViewFlag = keyof Pick<ViewFlagsProperties, "acsTriad" | "backgroundMap" | "grid" | "hiddenEdges" | "monochrome" | "visibleEdges" | "shadows">;

export interface AttrValues {
  renderMode: RenderMode;
  backgroundTransparency: number;
  cameraOn: boolean;
  skybox: boolean;
  viewFlags: Record<ViewFlag, boolean>;
}

/** This class implements the interaction between the sample and the iTwin.js API.  No user interface. */
export class api {

  public static settings: AttrValues = {
    renderMode: RenderMode.SmoothShade,
    backgroundTransparency: 0,
    cameraOn: true,
    skybox: true,
    viewFlags: {
      acsTriad: false,
      backgroundMap: true,
      grid: false,
      hiddenEdges: false,
      monochrome: false,
      visibleEdges: false,
      shadows: false,
    },
  };

  public static getAttrValues(vp: Viewport): AttrValues {
    return {
      renderMode: vp.viewFlags.renderMode,
      backgroundTransparency: api.getBackgroundTransparency(vp),
      cameraOn: vp.isCameraOn,
      skybox: api.isSkyboxOn(vp),
      viewFlags: {
        acsTriad: vp.viewFlags.acsTriad,
        backgroundMap: vp.viewFlags.backgroundMap,
        grid: vp.viewFlags.grid,
        hiddenEdges: vp.viewFlags.hiddenEdges,
        monochrome: vp.viewFlags.monochrome,
        visibleEdges: vp.viewFlags.visibleEdges,
        shadows: vp.viewFlags.shadows,
      },
    };
  }

  // Modify flag values using the Viewport API.
  public static setViewFlag(vp: Viewport, flag: ViewFlag, on: boolean) {
    vp.viewFlags = vp.viewFlags.with(flag, on);
    vp.synchWithView();
  }

  // Query map background transparency using the Viewport API
  public static getBackgroundTransparency(vp: Viewport) {
    return vp.backgroundMapSettings.transparency === false ? 1 : vp.backgroundMapSettings.transparency;
  }

  // Modify map background transparency using the Viewport API
  public static setBackgroundTransparency(vp: Viewport, transparency: number) {
    const style = vp.backgroundMapSettings.clone({ transparency });
    vp.displayStyle.backgroundMapSettings = style;
    vp.synchWithView();
  }

  // Modify camera setting using the Viewport API.
  public static setCameraOnOff(vp: Viewport, on: boolean) {
    if (on)
      vp.turnCameraOn();
    else
      (vp.view as ViewState3d).turnCameraOff();

    vp.synchWithView();
  }

  // Query skybox setting using the Viewport API.
  public static isSkyboxOn(vp: Viewport) {
    if (vp.view.is3d()) {
      const displayStyle = vp.view.getDisplayStyle3d();
      return displayStyle.environment.displaySky;
    }

    return false;
  }

  // Modify skybox setting using the Viewport API.
  public static setSkyboxOnOff(vp: Viewport, on: boolean) {
    if (vp.view.is3d()) {
      const style = vp.view.getDisplayStyle3d();
      style.environment = style.environment.withDisplay({ sky: on });
    }
  }

  // Query render model setting using the Viewport API.
  public static getRenderModel(vp: Viewport): RenderMode {
    return vp.viewFlags.renderMode;
  }

  // Modify render mode setting using the Viewport API.
  public static setRenderMode(vp: Viewport, mode: RenderMode) {
    const viewFlags = vp.viewFlags.override({ renderMode: mode });
    vp.viewFlags = viewFlags;
  }
}
