import {
  MessageSquare,
  MessageCircle,
  Smartphone,
  PhoneCall,
  UserCheck,
  Bell,
  LayoutDashboard,
  Megaphone,
  Camera,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import type { ChannelType } from '@/types';

interface ChannelIconProps {
  channel: ChannelType;
  size?: number;
}

const channelConfig: Record<
  ChannelType,
  { icon: ComponentType<LucideProps>; color: string }
> = {
  sms: { icon: MessageSquare, color: '#6366F1' },
  whatsapp: { icon: MessageCircle, color: '#25D366' },
  rcs: { icon: Smartphone, color: '#00BAF2' },
  ai_voice: { icon: PhoneCall, color: '#F59E0B' },
  field_executive: { icon: UserCheck, color: '#8B5CF6' },
  push_notification: { icon: Bell, color: '#EF4444' },
  in_app_banner: { icon: LayoutDashboard, color: '#0EA5E9' },
  facebook_ads: { icon: Megaphone, color: '#1877F2' },
  instagram_ads: { icon: Camera, color: '#E4405F' },
};

export function ChannelIcon({ channel, size = 20 }: ChannelIconProps) {
  const config = channelConfig[channel];
  const Icon = config.icon;

  return (
    <div
      className="inline-flex items-center justify-center rounded-md"
      style={{
        width: size + 12,
        height: size + 12,
        backgroundColor: `${config.color}1A`,
      }}
    >
      <Icon size={size} style={{ color: config.color }} />
    </div>
  );
}
