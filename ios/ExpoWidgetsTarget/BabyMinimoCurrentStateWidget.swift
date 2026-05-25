import WidgetKit
import SwiftUI
internal import ExpoWidgets

struct BabyMinimoCurrentStateWidget: Widget {
  let name: String = "BabyMinimoCurrentStateWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: name, provider: WidgetsTimelineProvider(name: name)) { entry in
      WidgetsEntryView(entry: entry)
    }
    .configurationDisplayName("BabyMinimo Snapshot")
    .description("Shows your latest BabyMinimo care snapshot.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}