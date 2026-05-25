import React from 'react'
import { HStack, Spacer, Text, VStack, ZStack } from '@expo/ui/swift-ui'
import {
  background,
  containerBackground,
  cornerRadius,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  padding,
  shapes,
} from '@expo/ui/swift-ui/modifiers'
import { createWidget, type WidgetEnvironment } from 'expo-widgets'
import {
  BABY_MINIMO_CURRENT_STATE_WIDGET_NAME,
  type BabyMinimoCurrentStateWidgetProps,
} from '@/src/features/widgets/currentStateWidgetProps'

const widgetColors = {
  sage: '#8DA089',
  sageText: '#6B7B68',
  softSage: '#F2F4F1',
  clay: '#D98E73',
  softClay: '#FDF4F1',
  cream: '#FAF9F6',
  border: '#EAE3D9',
  ink: '#2C2C2C',
  muted: '#9A9590',
  white: '#FFFFFF',
}

const defaultProps: BabyMinimoCurrentStateWidgetProps = {
  state: 'empty',
  babyName: 'BabyMinimo',
  stateBadgeLabel: 'EMPTY',
  statusLabel: 'Open the app',
  statusDetail: 'Refresh your care snapshot.',
  statusTone: 'muted',
  lastFeedLabel: 'No feed yet',
  lastDiaperLabel: 'No diaper yet',
  lastSleepLabel: 'No sleep yet',
  dueSoonTitle: 'Nothing due',
  dueSoonDetail: 'You are caught up.',
  lastUpdatedLabel: 'Not synced',
  message: '',
}

const toneColor = (tone: BabyMinimoCurrentStateWidgetProps['statusTone']) => {
  if (tone === 'clay') {
    return widgetColors.clay
  }

  if (tone === 'muted') {
    return widgetColors.muted
  }

  return widgetColors.sage
}

const toneBackground = (tone: BabyMinimoCurrentStateWidgetProps['statusTone']) =>
  tone === 'clay' ? widgetColors.softClay : widgetColors.softSage

const ValuePill = ({ label, value }: { label: string; value: string }) => (
  <VStack
    spacing={2}
    modifiers={[
      background(widgetColors.white, shapes.roundedRectangle({ cornerRadius: 14 })),
      cornerRadius(14),
      padding({ horizontal: 10, vertical: 8 }),
      frame({ maxWidth: 120, alignment: 'leading' }),
    ]}
  >
    <Text modifiers={[font({ size: 10, weight: 'bold' }), foregroundStyle(widgetColors.muted)]}>
      {label}
    </Text>
    <Text
      modifiers={[
        font({ size: 15, weight: 'bold', design: 'rounded' }),
        foregroundStyle(widgetColors.ink),
        lineLimit(1),
      ]}
    >
      {value}
    </Text>
  </VStack>
)

const StateBadge = ({
  label,
  tone,
}: {
  label: string
  tone: BabyMinimoCurrentStateWidgetProps['statusTone']
}) => (
  <Text
    modifiers={[
      font({ size: 10, weight: 'bold' }),
      foregroundStyle(toneColor(tone)),
      background(toneBackground(tone), shapes.roundedRectangle({ cornerRadius: 999 })),
      padding({ horizontal: 8, vertical: 4 }),
      lineLimit(1),
    ]}
  >
    {label}
  </Text>
)

const SmallWidget = ({ props }: { props: BabyMinimoCurrentStateWidgetProps }) => {
  const color = toneColor(props.statusTone)

  return (
    <VStack
      spacing={8}
      modifiers={[
        containerBackground(widgetColors.cream, 'widget'),
        padding({ all: 14 }),
        frame({ maxWidth: Infinity, maxHeight: Infinity, alignment: 'topLeading' }),
      ]}
    >
      <HStack spacing={6}>
        <ZStack
          modifiers={[
            background(toneBackground(props.statusTone), shapes.circle()),
            frame({ width: 28, height: 28 }),
          ]}
        >
          <Text modifiers={[font({ size: 14, weight: 'bold' }), foregroundStyle(color)]}>◔</Text>
        </ZStack>
        <Text
          modifiers={[
            font({ size: 16, weight: 'bold', design: 'rounded' }),
            foregroundStyle(widgetColors.ink),
            lineLimit(1),
          ]}
        >
          {props.babyName}
        </Text>
      </HStack>
      <StateBadge label={props.stateBadgeLabel} tone={props.statusTone} />

      <Spacer />

      <Text
        modifiers={[
          font({ size: 18, weight: 'bold', design: 'rounded' }),
          foregroundStyle(color),
          lineLimit(2),
        ]}
      >
        {props.statusLabel}
      </Text>
      <Text
        modifiers={[
          font({ size: 12, weight: 'medium' }),
          foregroundStyle(widgetColors.muted),
          lineLimit(2),
        ]}
      >
        {props.statusDetail}
      </Text>

      <Spacer />

      <VStack
        spacing={2}
        modifiers={[
          background(widgetColors.white, shapes.roundedRectangle({ cornerRadius: 14 })),
          cornerRadius(14),
          padding({ all: 9 }),
        ]}
      >
        <Text modifiers={[font({ size: 10, weight: 'bold' }), foregroundStyle(widgetColors.muted)]}>
          DUE SOON
        </Text>
        <Text
          modifiers={[
            font({ size: 13, weight: 'bold', design: 'rounded' }),
            foregroundStyle(widgetColors.ink),
            lineLimit(1),
          ]}
        >
          {props.dueSoonTitle}
        </Text>
        <Text modifiers={[font({ size: 11, weight: 'medium' }), foregroundStyle(color)]}>
          {props.dueSoonDetail}
        </Text>
      </VStack>
    </VStack>
  )
}

const MediumWidget = ({ props }: { props: BabyMinimoCurrentStateWidgetProps }) => {
  const color = toneColor(props.statusTone)

  return (
    <VStack
      spacing={9}
      modifiers={[
        containerBackground(widgetColors.cream, 'widget'),
        padding({ all: 16 }),
        frame({ maxWidth: Infinity, maxHeight: Infinity, alignment: 'topLeading' }),
      ]}
    >
      <HStack spacing={8}>
        <ZStack
          modifiers={[
            background(toneBackground(props.statusTone), shapes.circle()),
            frame({ width: 30, height: 30 }),
          ]}
        >
          <Text modifiers={[font({ size: 15, weight: 'bold' }), foregroundStyle(color)]}>◔</Text>
        </ZStack>
        <VStack spacing={1}>
          <Text
            modifiers={[
              font({ size: 17, weight: 'bold', design: 'rounded' }),
              foregroundStyle(widgetColors.ink),
              lineLimit(1),
            ]}
          >
            {props.babyName}
          </Text>
          <Text modifiers={[font({ size: 10, weight: 'medium' }), foregroundStyle(widgetColors.muted)]}>
            {props.lastUpdatedLabel}
          </Text>
        </VStack>
        <Spacer />
        <StateBadge label={props.stateBadgeLabel} tone={props.statusTone} />
      </HStack>

      <HStack spacing={8}>
        <ValuePill label="FEED" value={props.lastFeedLabel} />
        <ValuePill label="DIAPER" value={props.lastDiaperLabel} />
        <ValuePill label="SLEEP" value={props.lastSleepLabel} />
      </HStack>

      <HStack
        spacing={8}
        modifiers={[
          background(toneBackground(props.statusTone), shapes.roundedRectangle({ cornerRadius: 16 })),
          cornerRadius(16),
          padding({ horizontal: 12, vertical: 10 }),
        ]}
      >
        <VStack spacing={2}>
          <Text modifiers={[font({ size: 10, weight: 'bold' }), foregroundStyle(color)]}>
            DUE SOON
          </Text>
          <Text
            modifiers={[
              font({ size: 14, weight: 'bold', design: 'rounded' }),
              foregroundStyle(widgetColors.ink),
              lineLimit(1),
            ]}
          >
            {props.dueSoonTitle}
          </Text>
        </VStack>
        <Spacer />
        <Text modifiers={[font({ size: 12, weight: 'bold' }), foregroundStyle(color)]}>
          {props.dueSoonDetail}
        </Text>
      </HStack>
    </VStack>
  )
}

const BabyMinimoCurrentStateWidget = (
  props: BabyMinimoCurrentStateWidgetProps,
  environment: WidgetEnvironment
) => {
  'widget'

  const resolvedProps = { ...defaultProps, ...props }

  if (environment.widgetFamily === 'systemMedium') {
    return <MediumWidget props={resolvedProps} />
  }

  return <SmallWidget props={resolvedProps} />
}

export default createWidget<BabyMinimoCurrentStateWidgetProps>(
  BABY_MINIMO_CURRENT_STATE_WIDGET_NAME,
  BabyMinimoCurrentStateWidget
)
