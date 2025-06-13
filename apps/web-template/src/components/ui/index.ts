export { ProductCard, type ProductCardProps } from './ProductCard';

// UI components
export { default as Breadcrumb } from './Breadcrumb';
export { default as ReviewItem, type ReviewItemProps } from './ReviewItem';
export { default as Avatar, type AvatarProps } from './Avatar';

// Button components
export { ButtonPrimary, ButtonSecondary } from './Buttons';

// Header components
export {
  Header,
  Header2,
  Navigation,
  SidebarNavigation,
  AvatarDropdown,
  CartBtn,
  HamburgerBtnMenu,
  SearchBtnPopover,
  CollectionCard3,
  ButtonPrimary as HeaderButtonPrimary,
  SocialsList,
  Divider,
} from './Header';

export type {
  HeaderProps,
  Header2Props,
  NavigationProps,
  SidebarNavigationProps,
  TCollection,
  TNavigationItem,
  TProductImage,
  TLanguage,
  TCurrency,
  TDropdownCategory,
} from './Header';

// Filter components
export {
  SidebarFilters,
  TabFilters,
  TabFiltersPopover,
  ArchiveFilterListBox,
  Button,
  ButtonPrimary as FilterButtonPrimary,
  ButtonThird,
  ButtonClose,
  Checkbox,
  Radio,
  Input,
  Label,
  MySwitch,
  Divider as FilterDivider,
} from './Filters';

export type {
  ArchiveFilterListBoxProps,
  CheckboxProps,
  RadioProps,
  InputProps,
  LabelProps,
  MySwitchProps,
  ButtonProps,
  ButtonPrimaryProps,
  ButtonThirdProps,
  ButtonCloseProps,
} from './Filters';

// New UI components copied from design-system
export { default as Select, type SelectProps } from './Select';
export { default as Textarea, type TextareaProps } from './Textarea';
export { default as NcInputNumber, type NcInputNumberProps } from './NcInputNumber';
export { default as Heading, type HeadingProps } from './Heading';
export { default as NcImage, type NcImageProps } from './NcImage';
export { default as NextPrev, type NextPrevProps } from './NextPrev';

// Layout components
export { Footer } from '../layout/Footer';
export { default as Logo } from '../layout/Logo';

// Re-export Prices component from ProductCard
export { Prices } from './ProductCard';

// Re-export AddToCartButton component (it's part of ProductCard)
export { AddToCartButton } from './ProductCard';

// New components copied from design-system
export { default as AccordionInfo } from './AccordionInfo';
export { default as BgGlassmorphism } from './BgGlassmorphism';
export {
  default as FiveStartIconForRate,
  type FiveStartIconForRateProps,
} from './FiveStartIconForRate';
export { default as IconDiscount } from './IconDiscount';
export { default as LikeButton, type LikeButtonProps } from './LikeButton';
export { default as LikeSaveBtns } from './LikeSaveBtns';
export { default as ListingImageGallery, type ListingGalleryImage } from './ListingImageGallery';
export { default as ProductStatus } from './ProductStatus';
export { default as SectionClientSay, type SectionClientSayProps } from './SectionClientSay';
export { default as SectionPromo1, type SectionPromo1Props } from './SectionPromo1';
export { default as SectionPromo2, type SectionPromo2Props } from './SectionPromo2';
export {
  default as SectionSliderProductCard,
  type SectionSliderProductCardProps,
} from './SectionSliderProductCard';
export { default as VerifyIcon, type VerifyIconProps } from './VerifyIcon';

// Utility components
export { default as Alert, type AlertProps } from './Alert';
export { default as Badge, type BadgeProps, type BadgeColor } from './Badge';
export { default as Tag, type TagProps } from './Tag';
export { default as ButtonClose, type ButtonCloseProps } from './ButtonClose';
export { default as ButtonCircle, type ButtonCircleProps } from './ButtonCircle';
export { default as ButtonDropdown, type ButtonDropdownProps } from './ButtonDropdown';

// Pagination component
export {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from './Pagination';

// Shared components
export * from './shared/Button';
export { Link } from './shared/Link';
export * from './shared/Pagination';
export { type TProductItem } from './shared/ProductCard';
