import {
  AbstractWidgetProps,
  StagePanelLocation,
  StagePanelSection,
  UiItemsProvider,
} from '@itwin/appui-abstract';

// Widgets have to be created as classes that implement another class - the UiItemsProvider class.
// Since we are implementing another class, we have to define certain attributes and functions.
// In this case, we have to declare a "id" field and create a provideWidgets() function. 
export class SettingsUIProvider implements UiItemsProvider {
  // Every provider needs some kind of unique ID, so we give it one.
  public readonly id = 'SettingsUIProviderId';

  // Every widget provider needs to have this function in which we will
  // define how this widget works.
  public provideWidgets(
    stageId: string,
    stageUsage: string,

    // We have to define fields for the location (left, right, etc.) and
    // section (start, end, etc.) of the widget.
    location: StagePanelLocation,
    section?: StagePanelSection
  ): ReadonlyArray<AbstractWidgetProps> {

    // Since this is a widget provider, we can create multiple widgets
    // and add them to this array. In our case, we will be creating one.
    const widgets: AbstractWidgetProps[] = [];

    // We specify the location and section where we want the widget to be.
    if (
      location === StagePanelLocation.Right &&
      section === StagePanelSection.Start
    ) {
      // We define the widget itself in this object:
      const helloWidget: AbstractWidgetProps = {
        // It needs to have a unique ID.
        id: 'HelloWidget',
        // It also has to have some kind of name that is displayed as a tab title.
        label: 'Hello',

        // Then we can define the actual content of the widget.
        // Here you can pass in React components that can be complicated, have
        // different states, etc. But you can pass in simple HTML elements as well,
        // like lists, tables, images, etc.
        getWidgetContent() {
          // In our case it is just text element (span) with the text "Hello World".
          return <span>"Hello World"</span>;
        },
      };
      
      // We add (push) this one widget that we have defined into the array that
      // we created previously. This array is then passed further down the line
      // and all of the widgets defined in it are rendered in iTwin.
      widgets.push(helloWidget);
    }

    return widgets;
  }
}