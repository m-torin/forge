'use client';

import { ArrowRightIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import React, { type FC, useState } from 'react';

import { type TCollection, type TGroupCollection } from '../../data/types';
import svgs1 from '../../images/collections/explore1.svg';
import svgs2 from '../../images/collections/explore2.svg';
import svgs3 from '../../images/collections/explore3.svg';
import svgs4 from '../../images/collections/explore4.svg';
import svgs5 from '../../images/collections/explore5.svg';
import svgs6 from '../../images/collections/explore6.svg';
import svgs7 from '../../images/collections/explore7.svg';
import svgs8 from '../../images/collections/explore8.svg';
import svgs9 from '../../images/collections/explore9.png';
import CollectionCard1 from '../CollectionCard1';
import CollectionCard4 from '../CollectionCard4';
import CollectionCard6 from '../CollectionCard6';
import Heading from '../Heading/Heading';
import NavItem2 from '../NavItem2';
import ButtonSecondary from '../shared/Button/ButtonSecondary';
import Nav from '../shared/Nav/Nav';

export interface SectionGridMoreExploreProps {
  boxCard?: 'box1' | 'box4' | 'box6';
  className?: string;
  gridClassName?: string;
  groupCollections: TGroupCollection[];
  heading?: string;
}

const svgImages = [svgs1, svgs2, svgs3, svgs4, svgs5, svgs6, svgs7, svgs8, svgs9];

const SectionGridMoreExplore: FC<SectionGridMoreExploreProps> = ({
  gridClassName = 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  boxCard = 'box4',
  className,
  groupCollections,
  heading = 'Start exploring.',
}) => {
  const [tabActive, setTabActive] = useState(groupCollections[1].id);

  const renderCollectionCard = (collection: TCollection, index: number) => {
    switch (boxCard) {
      case 'box1':
        return <CollectionCard1 collection={collection} />;
      case 'box6':
        return <CollectionCard6 collection={collection} bgSvgUrl={svgImages[index] || svgs1} />;
      default:
        return <CollectionCard4 collection={collection} bgSvgUrl={svgImages[index] || svgs1} />;
    }
  };

  const groupSelected = groupCollections.find((group) => group.id === tabActive);
  return (
    <div className={clsx('relative', className)}>
      {/* Heading */}
      <Heading
        fontClass="text-3xl md:text-4xl 2xl:text-5xl font-semibold"
        className="mb-12 text-neutral-900 lg:mb-14 dark:text-neutral-50"
        isCenter
      >
        {heading}
      </Heading>
      <Nav
        containerClassName="mb-12 lg:mb-14 relative flex justify-center w-full text-sm md:text-base"
        className="hidden-scrollbar overflow-x-auto rounded-full bg-white p-1 shadow-lg dark:bg-neutral-800"
      >
        {groupCollections.map((group) => (
          <NavItem2
            key={group.id}
            onClick={() => setTabActive(group.id)}
            isActive={tabActive === group.id}
          >
            <div className="flex items-center justify-center gap-x-1.5 text-xs sm:gap-x-2.5 sm:text-sm">
              <span dangerouslySetInnerHTML={{ __html: group.iconSvg }} className="inline-block" />
              <span>{group.title}</span>
            </div>
          </NavItem2>
        ))}
      </Nav>

      {/* Collection Cards */}
      <div className={`grid gap-4 md:gap-7 ${gridClassName}`}>
        {groupSelected?.collections.map((collection, index) => (
          <React.Fragment key={collection.id}>
            {renderCollectionCard(collection, index)}
          </React.Fragment>
        ))}
      </div>

      {/* Button */}
      <div className="mt-20 flex justify-center">
        <ButtonSecondary href="/collections/all">
          Explore all collections
          <ArrowRightIcon className="ms-2.5 h-4 w-4" />
        </ButtonSecondary>
      </div>
    </div>
  );
};

export default SectionGridMoreExplore;
