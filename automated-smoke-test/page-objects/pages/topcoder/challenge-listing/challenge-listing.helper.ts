import { ChallengeListingPageObject } from './challenge-listing.po';
import { ConfigHelper } from '../../../../utils/config-helper';
import { CommonHelper } from '../common-page/common.helper';
import { HeaderPage } from '../header/header.po';
import { BrowserHelper, ElementHelper } from 'topcoder-testing-lib';
import { logger } from '../../../../logger/logger';

export class ChallengeListingPageHelper {
  /**
   * Initialize the challenge listing page object
   */
  public static initialize() {
    this.headerPageObject = new HeaderPage();
  }

  /**
   * Opens the Challenge Listing page
   */
  public static async open() {
    await ChallengeListingPageObject.open();
    await this.waitForLoadingNewChallengeList();
  }

  /**
   * Verify the redirection on clicking the login header link
   */
  public static async verifyLoginLink() {
    const expectedUrl = ConfigHelper.getLoginUrl();
    await this.headerPageObject.clickOnLoginLink();
    await CommonHelper.verifyCurrentUrlToContain(expectedUrl);
  }

  /**
   * Check if the open for registration challenges should be listed.
   */
  static async verifyOpenForRegistrationChallenges() {
    await CommonHelper.waitUntilVisibilityOf(
      () => ElementHelper.getElementByTag('h2'),
      'Wait for h2 tag',
      false
    );
    const headers = await ElementHelper.getAllElementsByTag('h2');
    const registrationChallenges = await headers[0].getText();
    expect(registrationChallenges).toEqual('Open for registration');
  }

  /**
   * fill and verify search results
   */
  static async fillAndVerifySearchResults() {
    await CommonHelper.waitUntilVisibilityOf(
      () => ChallengeListingPageObject.firstChallengeLink,
      'Wait for first challenge link',
      false
    );

    const searchString = ConfigHelper.getChallengeDetail().challengeName;
    await ChallengeListingPageObject.challengeSearchBox.sendKeys(searchString);
    await ChallengeListingPageObject.challengeSearchButton.click();
    await BrowserHelper.sleep(2000);

    const firstChallenge = ChallengeListingPageObject.firstChallengeLink;
    const firstChallengeName = await firstChallenge.getText();
    expect(firstChallengeName).toEqual(searchString);
  }

  /**
   * verify filter by toggle
   */
  static async verifyFilterToggle() {
    await this.openFiltersPanel();
    let filtersVisibility = await CommonHelper.isDisplayed(ChallengeListingPageObject.keywordsLabel);
    expect(filtersVisibility).toBe(true);
    await ChallengeListingPageObject.filterButton.click();
    filtersVisibility = await CommonHelper.isDisplayed(
      ChallengeListingPageObject.keywordsLabel
    );
    expect(filtersVisibility).toBe(false);
  }

  /**
   * select keyword
   */
  static async selectKeyword(keyword: string) {
    await ChallengeListingPageObject.keywordInput.sendKeys(keyword);
    await CommonHelper.waitUntilVisibilityOf(
      () => CommonHelper.selectOptionElement,
      'Wait for select option',
      false
    );
    await CommonHelper.selectOptionElement.click();
  }

  /**
   * select keyword
   */
  static async selectType(type: string) {
    await ChallengeListingPageObject.typeInput.sendKeys(type);
      await CommonHelper.waitUntilVisibilityOf(
      () => CommonHelper.selectOptionElement,
      'Wait for select option',
      false
    );
    await CommonHelper.selectOptionElement.click();
  }

  /**
   * check if dropdown for keyword is displayted
   */
  static async dropdownForKeywordIsDisplayed() {
    const isDisplayed = await CommonHelper.isDisplayed(ChallengeListingPageObject.keywordInput);
    expect(isDisplayed).toEqual(true);
  }

  /**
   * check if dropdown for type is displayted
   */
  static async dropdownForTypeIsDisplayed() {
    const isDisplayed = await CommonHelper.isDisplayed(ChallengeListingPageObject.typeInput);
    expect(isDisplayed).toEqual(true);
  }

  /**
   * check if dropdown for sub community is displayted
   */
  static async dropdownForSubCommunityIsDisplayed() {
    const isDisplayed = await CommonHelper.isDisplayed(ChallengeListingPageObject.subCommunityDropdown);
    expect(isDisplayed).toEqual(true);
  }

  /**
   * check if dropdown for date range is displayted
   */
  static async dropdownForDateRangeIsDisplayed() {
    const dateRangeStartDate = await ChallengeListingPageObject.dateRangeStartDate();
    const isDisplayed = await CommonHelper.isDisplayed(dateRangeStartDate);
    expect(isDisplayed).toEqual(true);
  }

  public static async scrollDownToPage(totalChallenge = 100) {
    const scrollCount = totalChallenge / 10 + 1;
      for (var i = 0; i < scrollCount; i++) {
        await BrowserHelper.executeScript('arguments[0].scrollIntoView();', CommonHelper.findElementByText(
          'a',
          'Policies'
        ));
        await BrowserHelper.sleep(1500);
    }
  }

  /**
   * Wait for fetching new challenge list
   */
  public static async waitForLoadingNewChallengeList() {

    // Scroll down until see footer.
    await BrowserHelper.executeScript('arguments[0].scrollIntoView();', CommonHelper.findElementByText(
      'a',
      'Policies'
    ));

    // sleeping since challenge number takes time to update
    BrowserHelper.sleep(5000);

    // wait for showing page
    await CommonHelper.waitUntilVisibilityOf(
      () => CommonHelper.findElementByText('span', 'All Challenges'),
      'Wait for all challenges',
      true
    );
  }

  private static async verifyChallengesMatchingKeyword(filters: Array<string>) {
    await this.waitForLoadingNewChallengeList();
    const challenges = await ChallengeListingPageObject.challengeLinks;
    for (let i = 0; i < challenges.length; i++) {
      const parentDiv = ElementHelper.getElementByXPath('..', challenges[i]);
      let skills = await ElementHelper.getAllElementsByCss(
        'button[type=button]',
        parentDiv
      );

      // expand skills by clicking on the hidden `+x` button
      for (let i = 0; i < skills.length; i++) {
        const skill = await skills[i];
        const text = await skill.getText();
        if (text[0] == '+') {
          await skill.click();
        }
      }

      skills = await ElementHelper.getAllElementsByCss(
        'button[type=button]',
        parentDiv
      );
      const skillsTexts = skills.map((skill) => skill.getText());
      expect(
        skillsTexts.filter(async (sPromise: Promise<string>) => {
          const s = await sPromise;
          for (let j = 0; j < filters.length; j++) {
            if (s.includes(filters[j])) {
              return true;
            }
          }
          return false;
        }).length > 0
      ).toBe(true);
    }
  }

  static async verifyFilterByKeywords() {
    await this.openFiltersPanel();
    await CommonHelper.waitUntilVisibilityOf(
      () => ChallengeListingPageObject.keywordsLabel,
      'Wait for keywords label',
      false
    );
    let filtersVisibility = await CommonHelper.isDisplayed(ChallengeListingPageObject.keywordsLabel);
    expect(filtersVisibility).toBe(true);

    await this.selectKeyword('Java');
    await this.verifyChallengesMatchingKeyword(['Java']);
  }

  private static async verifyChallengesMatchingType(
    expectedChallengesLength: number,
    filters: string | any[]
  ) {
    await this.scrollDownToPage(expectedChallengesLength);
    const challenges = await ChallengeListingPageObject.challengeLinks;
    let totalChallenges = 0;
    expect(challenges.length).toEqual(expectedChallengesLength);
    for (let j = 0; j < filters.length; j++) {
      const filter = filters[j];
      const matchingElements = await ChallengeListingPageObject.findAllElementsByText(
        'div',
        filter.name
      );
      totalChallenges += matchingElements.length;
    }
    expect(totalChallenges).toEqual(expectedChallengesLength);
  }

  static async verifyFilterByType() {
    await this.openFiltersPanel();
    await CommonHelper.waitUntilVisibilityOf(
      () => ChallengeListingPageObject.typeLabel,
      'Wait for type label',
      false
    );
    let filtersVisibility = await CommonHelper.isDisplayed(ChallengeListingPageObject.typeLabel);
    expect(filtersVisibility).toBe(true);
    await this.selectType('First2Finish');

    await this.viewMoreChallenges();

    // need to sleep to wait for ajax calls to be completed to filter using the above type
    await this.waitForLoadingNewChallengeList();
    const count = await this.getOpenForRegistrationChallengesCount();
    await this.verifyChallengesMatchingType(count, [{ name: 'F2F' }]);
  }

  static async selectSubCommunity(index: number) {
    await ChallengeListingPageObject.subCommunityDropdown.click();
    await BrowserHelper.sleep(3000);
    await CommonHelper.waitUntilVisibilityOf(
      () => CommonHelper.selectOptionElement,
      'Wait for select option',
      false
    );
    const allOptions = await CommonHelper.selectAllOptionsElement;
    const selectedOption = allOptions[index];
    logger.info('se ' + allOptions.length);
    if (selectedOption) {
      await allOptions[index].click();
      // need to sleep to wait for ajax calls to be completed to filter using the above type
      await BrowserHelper.sleep(5000);
      return true;
    } else {
      await ChallengeListingPageObject.subCommunityDropdown.click();
      return false;
    }
  }

  static async verifyFilterBySubCommunity() {
    await this.openFiltersPanel();
    await CommonHelper.waitUntilVisibilityOf(
      () => ChallengeListingPageObject.subCommunityLabel,
      'Wait for sub community label',
      false
    );
    let filtersVisibility = await CommonHelper.isDisplayed(ChallengeListingPageObject.subCommunityLabel);
    expect(filtersVisibility).toBe(true);

    await this.selectSubCommunity(1);

    let count = await this.getOpenForRegistrationChallengesCount();
    await this.scrollDownToPage(count);
    let challenges = await ChallengeListingPageObject.challengeLinks;

    expect(challenges.length).toEqual(count);

    await this.selectSubCommunity(0);
    challenges = await ChallengeListingPageObject.challengeLinks;
    expect(challenges.length > 0).toBe(true);
  }

  static async openFiltersPanel() {
    await CommonHelper.waitUntilVisibilityOf(
      () => ChallengeListingPageObject.filterButton,
      'Wait for filter button',
      false
    );
    await ChallengeListingPageObject.filterButton.click();
    BrowserHelper.sleep(1000);
    await CommonHelper.waitUntilVisibilityOf(
      () => ChallengeListingPageObject.keywordsLabel,
      'Wait for keyword label',
      false
    );
  }

  static async selectDateRange() {
    await CommonHelper.waitUntil(
      () => async () => {
        const daterange = await ChallengeListingPageObject.dateRangeStartDate();
        if (!(await CommonHelper.isDisplayed(daterange))) {
          return false;
        }
        return await CommonHelper.isDisplayed(daterange);
      },
      'wait for day range field',
      true
    );

    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const now = new Date();
    const currentDay = days[now.getDay()];
    const currentMonth = months[now.getMonth()];
    const currentYear = now.getFullYear();

    const nowPlusOne = new Date();
    nowPlusOne.setDate(nowPlusOne.getDate() + 1);

    const nextDay = days[nowPlusOne.getDay()];
    const nextDayMonth = months[nowPlusOne.getMonth()];
    const nextDayYear = nowPlusOne.getFullYear();

    const currentDayAriaText =
      'Choose ' +
      currentDay +
      ', ' +
      currentMonth +
      ' ' +
      now.getDate() +
      ', ' +
      currentYear +
      ' as your check-in date. It’s available.';
    const nextDayAriaText =
      'Choose ' +
      nextDay +
      ', ' +
      nextDayMonth +
      ' ' +
      nowPlusOne.getDate() +
      ', ' +
      nextDayYear +
      ' as your check-out date. It’s available.';

    const dateRangeStartDate = await ChallengeListingPageObject.dateRangeStartDate();
    await dateRangeStartDate.click();
    await BrowserHelper.sleep(1000);
    await CommonHelper.getLinkByAriaLabel(currentDayAriaText).click();
    await CommonHelper.getLinkByAriaLabel(nextDayAriaText).click();
    await BrowserHelper.sleep(1000);
  }

  static async verifyNumberOfAppliedFilters(
    expectedNumberOfAppliedFilters: number
  ) {
    const appliedFiltersText = await ChallengeListingPageObject.appliedFilters.getText();
    if (expectedNumberOfAppliedFilters === 0) {
      expect(appliedFiltersText).toEqual('Filters');
    } else {
      expect(appliedFiltersText).toEqual(
        'Filters' + expectedNumberOfAppliedFilters
      );
    }
  }

  static async verifyFilterByKeywordsAndType() {
    await this.selectKeyword('Java');
    await this.selectType('Challenge');
    await this.verifyChallengesMatchingKeyword(['Java']);
    const count = await this.getOpenForRegistrationChallengesCount();
    await this.verifyChallengesMatchingType(count, [{ name: 'CH' }]);
  }

  /**
   * verify filter by multiple keywords
   */
  static async verifyFilterByMultipleKeywords() {
    await this.selectKeyword('Java');
    await this.selectKeyword('HTML5');
    await this.verifyChallengesMatchingKeyword(['Java', 'HTML5']);
  }

  /**
   * view more challenge
   */
  static async viewMoreChallenges() {
    const viewMoreChallenges = await ChallengeListingPageObject.viewMoreChallenges;
    viewMoreChallenges.map(async (c) => {
      await BrowserHelper.waitUntilClickableOf(c);
      await BrowserHelper.sleep(3000);
      if (await CommonHelper.isPresent(c)) {
        await c.click();
      }
    });
  }

  /**
   * verify filter by multiple types
   */
  static async verifyFilterByMultipleTypes() {
    await this.selectType('Challenge');
    await this.selectType('First2Finish');

    // await this.viewMoreChallenges();

    const count = await this.getOpenForRegistrationChallengesCount();

    await this.verifyChallengesMatchingType(count, [
      { name: 'F2F' },
      { name: 'CH' },
    ]);
  }

  /**
   * verify removal of keyword
   */
  static async verifyRemovalOfKeyword() {
    const removeTags = await ChallengeListingPageObject.allRemoveTags();
    // remove HTML5 tag
    await removeTags[1].click();
    await this.verifyChallengesMatchingKeyword(['Java']);
  }

  /**
   * verify removal of type
   */
  static async verifyRemovalOfType() {
    const removeTags = await ChallengeListingPageObject.allRemoveTags();
    await removeTags[1].click();
    const count = await this.getOpenForRegistrationChallengesCount();
    await this.verifyChallengesMatchingType(count, [{ name: 'F2F' }]);
  }

  /**
   * click clear filter
   */
  static async clearFilters() {
    await CommonHelper.findElementByText('button', 'Clear filters').click();
  }

  /**
   * verify sort function
   */
  static async verifySortingFunctionality() {
    await BrowserHelper.sleep(2000);
    const el = await ChallengeListingPageObject.selectSortOfOpenForRegistrationChallenges();
    await el.click();

    await CommonHelper.waitUntilVisibilityOf(
      () => ChallengeListingPageObject.selectSortByTitleOption,
      'Wait for select sort by title',
      false
    );
    await ChallengeListingPageObject.selectSortByTitleOption.click();

    const challenges = await ChallengeListingPageObject.submissionTitle();
    if (challenges.length > 0) {
      let titleOfCurrentChallenge = await challenges[0].getText();

      for (let i = 1; i < challenges.length; i++) {
        const text = await challenges[i].getText();
        expect(titleOfCurrentChallenge <= text).toBe(true);
        titleOfCurrentChallenge = text;
      }
    }
  }

  /**
   * Check if section with header present
   * @param header header string
   */
  static async waitTillHeaderPresentWithText(header: string) {
    await CommonHelper.waitUntil(
      () => async () => {
        const headers = await CommonHelper.h2Fields;
        const texts = [];
        for (let i = 1; i < headers.length; i++) {
          const text = await headers[i].getText();
          texts.push(text);
        }
        return texts.indexOf(header) >= 0;
      },
      `Wait for ${header} header`,
      false
    );
  }

  /**
   * Wait until only one header present
   * @param header header of challenges section
   */
  static async waitTillOnlyOneHeaderPresentWithText(header: string) {
    await CommonHelper.waitUntil(
      () => async () => {
        const headers = await CommonHelper.h2Fields;
        const text = headers.length !== 0 ? await headers[0].getText() : '';
        return headers.length === 1 && text === header;
      },
      `Wait for only show ${header} header`,
      false
    );
  }

  /**
   * verify view more challenges button
   */
  static async verifyViewMoreChallenges() {
    const els = await ChallengeListingPageObject.viewMoreChallenges;
    for (let i = 0; i < els.length; i++) {
      // get view more challenges buttons again when change the menu
      const allViewMoreLinks = await ChallengeListingPageObject.viewMoreChallenges;

      const href = await allViewMoreLinks[i].getAttribute('href');
      const splits = href.split('?bucket=');
      const bucket = splits[1];
      if (bucket == 'openForRegistration') {
        await allViewMoreLinks[i].click();
      }

      const allChallengesLink = await ChallengeListingPageObject.filterChallengesBy(
        'All Challenges'
      );
      await allChallengesLink.click();
    }
  }

  /**
   * verify challenges by challenge tag
   */
  static async verifyChallengesByChallengeTag() {
    const tagText = ConfigHelper.getChallengeDetail().challengeTag;

    await CommonHelper.waitUntilVisibilityOf(
      () => ChallengeListingPageObject.getChallengeTag(tagText),
      'Wait for tag',
      false
    );
    await ChallengeListingPageObject.getChallengeTag(tagText).click();
    // waiting for re-render to happen
    await BrowserHelper.sleep(15000);

    const checkTagMatchWithChallenge = async (challenges) => {
      for (let i = 0; i < challenges.length; i++) {
        const skills = (
          await ChallengeListingPageObject.findSkillsForChallenge(challenges[i])
        ).join('');
        expect(skills.indexOf(tagText) >= 0).toBe(true);
      }
    };
    const registrationChallenges = await ChallengeListingPageObject.openForRegistrationChallenges;
    await checkTagMatchWithChallenge(registrationChallenges);
  }

  /**
   * Veirfy challenge count by toggling development
   */
  static async verifyChallengeCountByTogglingDevelopment() {
    let openForRegistrationChallenges = await ChallengeListingPageObject.filterChallengesBy(
      'Open for registration'
    );
    await openForRegistrationChallenges.click();
    await this.waitTillOnlyOneHeaderPresentWithText('Open for registration');

    // switch off development
    let el = await ChallengeListingPageObject.developmentSwitch();
    await el.click();
    await CommonHelper.waitUntilPresenceOf(
      () => ChallengeListingPageObject.developmentSwitchTurnedOff,
      'wait for development switch turn off',
      false
    );

    await this.scrollDownToPage();
    await this.waitForLoadingNewChallengeList();

    let challenges = await ChallengeListingPageObject.openForRegistrationChallenges;
    const afterOpenForRegistrationChallengesCount = await this.getOpenForRegistrationChallengesCount();
    expect(afterOpenForRegistrationChallengesCount).toEqual(challenges.length);
  }

  /**
   * Get challenge count of any tab
   * @param tabName tab name
   * @param shouldWait should wait for fetching challenge complete
   */
  static async getAnyChallengesCount(tabName: string, shouldWait = false) {
    // the challenge count will change after loading depend on the request loading time,
    // not sure how to resolve this
    // just wait for now
    await BrowserHelper.sleep(5000);
    const challenges = await ChallengeListingPageObject.filterChallengesBy(
      tabName
    );
    let challengesText = await challenges.getText();
    challengesText = challengesText.replace(/(\r\n|\n|\r)/gm, ' ');
    const count = parseInt(challengesText.split(tabName)[1]);
    return count || 0;
  }

  /**
   * get all challenges count
   */
  static async getAllChallengesCount() {
    return this.getAnyChallengesCount('All Challenges');
  }

  /**
   * get ongoing challenges count
   */
  static async getOngoingChallengesCount() {
    return this.getAnyChallengesCount('Ongoing challenges', true);
  }

  /**
   * get open for registration challenges count
   */
  static async getOpenForRegistrationChallengesCount() {
    return this.getAnyChallengesCount('Open for registration');
  }

  /**
   * navigate to first challenge
   */
  static async navigateToFirstChallenge() {
    const challengeLinks = await ChallengeListingPageObject.openForRegistrationChallenges;
    await challengeLinks[0].click();
  }

  /**
   * verify all challenges
   */
  static async verifyAllChallenges() {
    await this.verifyOpenForRegistrationChallenges();
  }

  /**
   * verify open for registration challenges only
   */
  static async verifyOpenForRegistrationChallengesOnly() {
    const openForRegistrationLink = await ChallengeListingPageObject.filterChallengesBy(
      'Open for registration'
    );
    await openForRegistrationLink.click();
    await this.waitTillOnlyOneHeaderPresentWithText('Open for registration');
    await this.verifyOpenForRegistrationChallenges();
  }

  /**
   * veirfy ongoing challenges only
   */
  static async verifyOngoingChallengesOnly() {
    const ongoingChallengesLink = await ChallengeListingPageObject.filterChallengesBy(
      'Ongoing challenges'
    );
    await ongoingChallengesLink.click();
    await this.waitTillOnlyOneHeaderPresentWithText('Ongoing challenges');

    await CommonHelper.waitUntilVisibilityOf(
      () => CommonHelper.findElementByText('span', 'Ends '),
      'Wait for ends element',
      false
    );
  }

  /**
   * verify open for review challenges
   */
  static async verifyOpenForReviewChallenges() {
    const reviewStatusEls = await ChallengeListingPageObject.reviewStatusElements();

    for (let i = 0; i < reviewStatusEls.length; i++) {
      const el = reviewStatusEls[i];
      const status = await el.getText();
      expect(status.includes('Review')).toBe(true);
    }
  }

  /**
   * verify open for review challenges only
   */
  static async verifyOpenForReviewChallengesOnly() {
    const openForReviewLink = await ChallengeListingPageObject.filterChallengesBy(
      'Open for review'
    );
    await openForReviewLink.click();
    await this.waitForLoadingNewChallengeList();

    await CommonHelper.waitUntilVisibilityOf(
      () => CommonHelper.findElementByText('span', 'Review'),
      'Wait for review element',
      false
    );

    await this.verifyOpenForReviewChallenges();
    const headers = await CommonHelper.h2Fields;
    expect(headers.length).toEqual(1);
  }

  /**
   * verify past challenge only
   */
  static async verifyPastChallengesOnly() {
    const pastChallengesLink = await ChallengeListingPageObject.filterChallengesBy(
      'Past challenges'
    );
    await pastChallengesLink.click();

    await CommonHelper.waitUntilVisibilityOf(
      () => CommonHelper.findElementByText('span', 'Ended '),
      'Wait for ended element',
      false
    );

    const headers = await CommonHelper.h2Fields;
    expect(headers.length).toEqual(1);
  }

  /**
   * verify challenges with all switch buttons turned off
   */
  static async verifyWithAllSwitchesTurnedOff() {
    let el = await ChallengeListingPageObject.designSwitch();
    await el.click();
    await CommonHelper.waitUntilPresenceOf(
      () => ChallengeListingPageObject.designSwitchTurnedOff,
      'wait for design switch turn off',
      false
    );

    el = await ChallengeListingPageObject.developmentSwitch();
    await el.click();
    await CommonHelper.waitUntilPresenceOf(
      () => ChallengeListingPageObject.developmentSwitchTurnedOff,
      'wait for development switch turn off',
      false
    );

    el = await ChallengeListingPageObject.dataScienceSwitch();
    await el.click();
    await CommonHelper.waitUntilPresenceOf(
      () => ChallengeListingPageObject.dataScienceSwitchTurnedOff,
      'wait for data science switch turn off',
      false
    );

    el = await ChallengeListingPageObject.qaSwitch();
    await el.click();
    await CommonHelper.waitUntilPresenceOf(
      () => ChallengeListingPageObject.qaSwitchTurnedOff,
      'wait for qa switch turn off',
      false
    );

    const headers = await CommonHelper.h2Fields;
    expect(headers.length).toBe(0);

    const openForReviewLink = await ChallengeListingPageObject.filterChallengesBy(
      'Open for review'
    );
    await openForReviewLink.click();

    await this.waitTillOnlyOneHeaderPresentWithText('Open for review');
    await CommonHelper.waitUntilVisibilityOf(
      () =>
        CommonHelper.findElementByText(
          'div',
          'There are no review opportunities available'
        ),
      'Wait for no review element',
      true
    );
  }

  /**
   * Click on rss link
   */
  static async clickOnRssLink() {
    const el = await ChallengeListingPageObject.rssLink();
    await el.click();
  }

  /**
   * verify rss page
   */
  static async verifyRssPage() {
    await CommonHelper.waitUntil(
      () => async () => {
        const url = await BrowserHelper.getCurrentUrl();
        return url.indexOf(ConfigHelper.getChallangesLinks().rssFeedUrl) >= 0;
      },
      'wait for match rss feed url',
      false
    );
  }

  /**
   * Verify link under rss
   * @param label lable of link
   * @param expectedUrl expected url
   */
  static async verifyLinkUnderRss(label: string, expectedUrl: string) {
    const el = await ChallengeListingPageObject.getLinkUnderRss(label);
    await el.click();
    await CommonHelper.verifyPopupWindowWithUrl(
      expectedUrl,
      'Wrong link for ' + label
    );
  }

  /**
   * verify link under rss
   */
  static async verifyLinksUnderRss() {
    const linksConfig = [
      {
        label: 'About',
        expectedUrl: ConfigHelper.getChallangesLinks().aboutUrl,
      },
      {
        label: 'Contact',
        expectedUrl: ConfigHelper.getChallangesLinks().contactUrl,
      },
      {
        label: 'Help',
        expectedUrl: ConfigHelper.getChallangesLinks().helpUrl,
      },
      {
        label: 'Privacy',
        expectedUrl: ConfigHelper.getChallangesLinks().privacyUrl,
      },
      {
        label: 'Terms',
        expectedUrl: ConfigHelper.getChallangesLinks().termsUrl,
      },
    ];
    for (let i = 0; i < linksConfig.length; i++) {
      const linkConfig = linksConfig[i];
      await this.verifyLinkUnderRss(linkConfig.label, linkConfig.expectedUrl);
    }
  }

  /**
   * Verify challenges after login
   */
  static async verifyChallengesAfterLogin() {
    await CommonHelper.waitUntilVisibilityOf(
      () => ElementHelper.getElementByTag('h2'),
      'Wait for h2 tag',
      false
    );
    const headers = await CommonHelper.h2Fields;
    let expectedHeaders = ['Open for registration'];
    for (let i = 0; i < headers.length; i++) {
      const headerText = await headers[i].getText();
      expect(headerText).toEqual(expectedHeaders[i]);
    }
  }

  /**
   * Verify clear filter button
   * @param enabled check if enable
   */
  static async verifyClearFilterState(enabled: boolean) {
    const cursorPointer = await ElementHelper.getElementByClassName(
      '_22SITo'
    ).getCssValue('cursor');
    expect(cursorPointer !== 'not-allowed').toEqual(enabled);
  }

  private static headerPageObject: HeaderPage;
}
