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
  IconTrash,
  IconCopy,
  IconPhone,
  IconId,
  IconMail,
  IconShieldCheck,
  IconInfoCircle,
  IconDotsVertical,
  IconAlertCircle,
  IconPencil,
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
  | 'trash'
  | 'copy'
  | 'phone'
  | 'id'
  | 'mail'
  | 'shield-check'
  | 'info-circle'
  | 'dots-vertical'
  | 'alert-circle'
  | 'pencil'
  | 'edit';

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
  trash: IconTrash,
  copy: IconCopy,
  phone: IconPhone,
  id: IconId,
  mail: IconMail,
  'shield-check': IconShieldCheck,
  'info-circle': IconInfoCircle,
  'dots-vertical': IconDotsVertical,
  'alert-circle': IconAlertCircle,
  pencil: IconPencil,
  edit: IconPencil,
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
