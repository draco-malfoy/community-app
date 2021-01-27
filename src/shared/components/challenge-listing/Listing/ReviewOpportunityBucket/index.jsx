/**
 * The bucket for review opportunities.
 */
import _ from 'lodash';
import PT from 'prop-types';
import React from 'react';
import Sort from 'utils/challenge-listing/sort';
import { BUCKET_DATA, BUCKETS } from 'utils/challenge-listing/buckets';
import SortingSelectBar from 'components/SortingSelectBar';
import Waypoint from 'react-waypoint';
import { challenge as challengeUtils } from 'topcoder-react-lib';
import CardPlaceholder from '../../placeholders/ChallengeCard';
import ReviewOpportunityCard from '../../ReviewOpportunityCard';

import './style.scss';

const Filter = challengeUtils.filter;

const NO_RESULTS_MESSAGE = 'There are no review opportunities available';

// Functional implementation of ReviewOpportunityBucket component
export default function ReviewOpportunityBucket({
  bucket,
  challengesUrl,
  expandedTags,
  expandTag,
  filterState,
  keepPlaceholders,
  loading,
  loadMore,
  opportunities,
  setFilterState,
  setSort,
  challengeTypes,
  sort,
  setSearchText,
}) {
  if (!opportunities.length && !loadMore) return null;

  const types = _.get(filterState, 'types', []);
  let bucketSorts = BUCKET_DATA[bucket].sorts;
  const isRecommended = types.indexOf('Recommended') >= 0;
  if (bucket === BUCKETS.OPEN_FOR_REGISTRATION && isRecommended) {
    bucketSorts = BUCKET_DATA[bucket].sorts2;
  }

  let activeSort = sort || bucketSorts[0];
  if (bucketSorts.length && bucketSorts.indexOf(sort) < 0) {
    // eslint-disable-next-line prefer-destructuring
    activeSort = bucketSorts[0];
  }

  const sortedOpportunities = _.clone(opportunities);
  sortedOpportunities.sort(Sort[activeSort].func);

  /* Filtering for Review Opportunities will be done entirely in the front-end
   * which means it can be done at render, rather than in the reducer,
   * which avoids reloading the review opportunities from server every time
   * a filter is changed.  */
  const filteredOpportunities = sortedOpportunities.filter(
    Filter.getReviewOpportunitiesFilterFunction({
      ...BUCKET_DATA[bucket].filter, // Default bucket filters from utils/buckets.js
      ...filterState, // User selected filters
    }, challengeTypes),
    // }),
  );

  const cards = filteredOpportunities.map(item => (
    <ReviewOpportunityCard
      challengesUrl={challengesUrl}
      challengeType={_.find(challengeTypes, { name: item.challenge.type }) || {}}
      expandedTags={expandedTags}
      expandTag={expandTag}
      onTechTagClicked={(tag) => {
        setFilterState({ search: tag });
        setSearchText(tag);
      }}
      opportunity={item}
      key={item.id}
    />
  ));

  const placeholders = [];
  if ((loading || keepPlaceholders) && cards.length === 0) {
    for (let i = 0; i < 10; i += 1) {
      placeholders.push(<CardPlaceholder id={i} key={i} />);
    }
  }

  return (
    <div styleName="review-opportunity-bucket">
      <SortingSelectBar
        title="Open for review"
        onSelect={setSort}
        options={
          BUCKET_DATA[bucket].sorts.map(item => ({
            label: Sort[item].name,
            value: item,
          }))
        }
        value={{
          label: Sort[activeSort].name,
          value: activeSort,
        }}
      />
      {cards}
      {
        !loading && filteredOpportunities.length === 0 && (
          <div styleName="no-results">
            {NO_RESULTS_MESSAGE}
          </div>
        )
      }
      {
        loadMore && !loading && filterState.reviewOpportunityTypes.length ? (
          <Waypoint onEnter={loadMore} />
        ) : null
      }
      {placeholders}
    </div>
  );
}

// Default Props
ReviewOpportunityBucket.defaultProps = {
  expandedTags: [],
  expandTag: null,
  keepPlaceholders: false,
  loading: false,
  loadMore: null,
  sort: null,
};

// Prop Validation
ReviewOpportunityBucket.propTypes = {
  // bucket: PT.shape().isRequired,
  bucket: PT.string.isRequired,
  challengesUrl: PT.string.isRequired,
  expandedTags: PT.arrayOf(PT.number),
  expandTag: PT.func,
  filterState: PT.shape().isRequired,
  opportunities: PT.arrayOf(PT.shape()).isRequired,
  keepPlaceholders: PT.bool,
  loading: PT.bool,
  loadMore: PT.func,
  setFilterState: PT.func.isRequired,
  setSort: PT.func.isRequired,
  sort: PT.string,
  challengeTypes: PT.arrayOf(PT.shape()).isRequired,
  setSearchText: PT.func.isRequired,
};
