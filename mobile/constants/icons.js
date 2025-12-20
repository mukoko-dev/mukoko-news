/**
 * Icon Constants - Centralized icon mapping using Lucide React Native
 * Mukoko News - Nyuchi Brand System v6
 *
 * All icons use Lucide React Native for consistency
 * Import from this file instead of using icon libraries directly
 */

import {
  // Navigation
  Zap,
  ZapOff,
  Globe,
  Search,
  Compass,
  User,
  ShieldCheck,
  Home,

  // Actions
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Plus,
  Minus,

  // Content
  Newspaper,
  Bookmark,
  BookmarkCheck,
  Heart,
  Share2,
  MessageCircle,
  Eye,
  EyeOff,
  TrendingUp,
  Clock,
  Calendar,

  // User & Profile
  UserCircle,
  UserPlus,
  Users,
  Settings,
  LogOut,
  Award,
  Crown,
  QrCode,

  // Status & Alerts
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Bell,
  BellOff,

  // Media & Content
  Image,
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Camera,

  // Analytics & Stats
  BarChart2,
  LineChart,
  PieChart,
  TrendingDown,
  Activity,
  Flame,

  // Admin & Management
  Shield,
  ShieldAlert,
  Lock,
  Unlock,
  Key,
  Edit,
  Trash2,
  FileText,
  Database,
  Server,

  // Social
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Link,

  // Misc
  Gift,
  Sparkles,
  Rocket,
  Target,
  Vibrate,
  Moon,
  Sun,
  Globe2,
  Map,
  MapPin,
  Filter,
} from 'lucide-react-native';

/**
 * Icon mappings for easy import
 * Usage: import { ICONS } from '@/constants/icons'
 */
export const ICONS = {
  // Navigation
  home: Home,
  bytes: Zap,
  bytesOutline: ZapOff,
  pulse: Globe,
  search: Search,
  discover: Compass,
  profile: User,
  profileOutline: User,
  admin: ShieldCheck,
  adminOutline: ShieldCheck,

  // Actions
  refresh: RefreshCw,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  close: X,
  check: Check,
  add: Plus,
  remove: Minus,

  // Content
  article: Newspaper,
  bookmark: Bookmark,
  bookmarkFilled: BookmarkCheck,
  like: Heart,
  share: Share2,
  comment: MessageCircle,
  view: Eye,
  hide: EyeOff,
  trending: TrendingUp,
  trendingDown: TrendingDown,
  history: Clock,
  calendar: Calendar,

  // User & Profile
  account: UserCircle,
  accountOutline: User,
  accountPlus: UserPlus,
  accountGroup: Users,
  settings: Settings,
  logout: LogOut,
  achievement: Award,
  crown: Crown,
  qrcode: QrCode,

  // Status & Alerts
  alert: AlertCircle,
  alertCircleOutline: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
  error: XCircle,
  notification: Bell,
  notificationOff: BellOff,

  // Media
  image: Image,
  video: Video,
  play: Play,
  pause: Pause,
  volumeOn: Volume2,
  volumeOff: VolumeX,
  camera: Camera,

  // Analytics
  chart: BarChart2,
  chartLine: LineChart,
  chartPie: PieChart,
  chartBox: BarChart2,
  chartTimeline: Activity,
  activity: Activity,
  fire: Flame,

  // Admin
  shield: Shield,
  shieldAlert: ShieldAlert,
  shieldCrown: ShieldCheck,
  shieldCrownOutline: ShieldCheck,
  lock: Lock,
  lockOpen: Unlock,
  key: Key,
  edit: Edit,
  delete: Trash2,
  document: FileText,
  database: Database,
  server: Server,
  shieldEdit: Shield,

  // Social
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  mail: Mail,
  link: Link,
  whatsapp: MessageCircle, // Using MessageCircle as placeholder

  // Misc
  gift: Gift,
  sparkles: Sparkles,
  rocket: Rocket,
  rocketLaunch: Rocket,
  target: Target,
  vibrate: Vibrate,
  moon: Moon,
  sun: Sun,
  earth: Globe2,
  map: Map,
  location: MapPin,
  filter: Filter,
  compass: Compass,
  compassOutline: Compass,
  magnify: Search,
  starCircle: Award,
};

/**
 * Get icon component by name
 * @param {string} name - Icon name from ICONS object
 * @returns {Component} Lucide icon component
 */
export function getIcon(name) {
  return ICONS[name] || AlertCircle;
}

/**
 * Icon sizes following Mukoko design system
 */
export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

/**
 * Icon component with themed colors
 * Usage: <Icon name="home" size="md" />
 */
export function Icon({ name, size = 'md', color, className = '', ...props }) {
  const IconComponent = getIcon(name);
  const iconSize = typeof size === 'number' ? size : ICON_SIZES[size];

  return (
    <IconComponent
      size={iconSize}
      color={color || '#1C1B1F'}
      className={className}
      {...props}
    />
  );
}

export default ICONS;
