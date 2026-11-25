import React from 'react';
import {
  IconHome,
  IconSearch,
  IconWallet,
  IconKey,
  IconCurrencyDollar,
  IconStar,
  IconReceipt,
  IconCoins,
  IconArrowLeft,
  IconChevronRight,
  IconCheck,
  IconPlus,
  IconX,
  IconBuildingBank,
  IconBuildingStore,
  IconClock,
  IconCircleCheck,
  IconBell,
  IconQrcode,
  IconInfoCircle,
  IconCash,
  IconArrowsSplit,
  IconDeviceMobile,
  IconCalculator,
  IconArrowRight,
  IconMinus,
  IconTrash,
  IconClipboardCheck,
  IconFileText,
  IconLock,
  IconMapPin,
  IconPhone,
  IconTruck,
  IconShare,
  IconDownload,
  IconAlertTriangle,
  IconCalendar,
  IconRefresh,
  IconChartBar,
  IconUser,
  IconEye,
  IconEyeOff,
  IconAlertCircle,
  IconLogout,

  type TablerIcon
} from '@tabler/icons-react';

export type IconName =
  | 'home'
  | 'search'
  | 'wallet'
  | 'key'
  | 'dollar'
  | 'star'
  | 'receipt'
  | 'coins'
  | 'arrow-left'
  | 'chevron-right'
  | 'check'
  | 'plus'
  | 'x'
  | 'building-bank'
  | 'building-store'
  | 'clock'
  | 'circle-check'
  | 'bell'
  | 'qrcode'
  | 'info-circle'
  | 'cash'
  | 'arrows-split'
  | 'device-mobile'
  | 'calculator'
  | 'arrow-right'
  | 'minus'
  | 'trash'
  | 'clipboard-check'
  | 'file-text'
  | 'lock'
  | 'map-pin'
  | 'phone'
  | 'truck'
  | 'share'
  | 'download'
  | 'alert-triangle'
  | 'calendar'
  | 'refresh'
  | 'chart-bar'
  | 'user'
  | 'eye'
  | 'eye-off'
  | 'alert-circle'
  | 'logout';

const iconMap: Record<IconName, TablerIcon> = {
  home: IconHome,
  search: IconSearch,
  wallet: IconWallet,
  key: IconKey,
  dollar: IconCurrencyDollar,
  star: IconStar,
  receipt: IconReceipt,
  coins: IconCoins,
  'arrow-left': IconArrowLeft,
  'chevron-right': IconChevronRight,
  check: IconCheck,
  plus: IconPlus,
  x: IconX,
  'building-bank': IconBuildingBank,
  'building-store': IconBuildingStore,
  clock: IconClock,
  'circle-check': IconCircleCheck,
  bell: IconBell,
  qrcode: IconQrcode,
  'info-circle': IconInfoCircle,
  cash: IconCash,
  'arrows-split': IconArrowsSplit,
  'device-mobile': IconDeviceMobile,
  calculator: IconCalculator,
  'arrow-right': IconArrowRight,
  minus: IconMinus,
  trash: IconTrash,
  'clipboard-check': IconClipboardCheck,
  'file-text': IconFileText,
  lock: IconLock,
  'map-pin': IconMapPin,
  phone: IconPhone,
  truck: IconTruck,
  share: IconShare,
  download: IconDownload,
  'alert-triangle': IconAlertTriangle,
  calendar: IconCalendar,
  refresh: IconRefresh,
  'chart-bar': IconChartBar,
  user: IconUser,
  eye: IconEye,
  'eye-off': IconEyeOff,
  'alert-circle': IconAlertCircle,
  logout: IconLogout,

};

interface IconProps {
  name: IconName;
  size?: number | string;
  className?: string;
  stroke?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  className = '',
  stroke = 2,
}) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent size={size} stroke={stroke} className={className} />;
};
