import { query, type RouteDefinition } from "@solidjs/router";
import { graphql } from "relay-runtime";
import { Show } from "solid-js";
import {
  createPreloadedQuery,
  loadQuery,
  useRelayEnvironment,
} from "solid-relay";
import { PersonalTimeline } from "~/components/PersonalTimeline.tsx";
import { TopBreadcrumb } from "~/components/TopBreadcrumb.tsx";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb.tsx";
import { useLingui } from "~/lib/i18n/macro.d.ts";
import type { articlesFeedTimelineQuery } from "./__generated__/articlesFeedTimelineQuery.graphql.ts";

export const route = {
  preload() {
    const { i18n } = useLingui();
    void loadArticlesFeedTimelineQuery(i18n.locale);
  },
} satisfies RouteDefinition;

const articlesFeedTimelineQuery = graphql`
  query articlesFeedTimelineQuery($locale: Locale) {
    ...PersonalTimeline_posts @arguments(locale: $locale, postType: ARTICLE)
  }
`;

const loadArticlesFeedTimelineQuery = query(
  (locale: string) =>
    loadQuery<articlesFeedTimelineQuery>(
      useRelayEnvironment()(),
      articlesFeedTimelineQuery,
      { locale },
    ),
  "loadArticlesFeedTimelineQuery",
);

export default function ArticlesFeedTimeline() {
  const { i18n, t } = useLingui();
  const data = createPreloadedQuery<articlesFeedTimelineQuery>(
    articlesFeedTimelineQuery,
    () => loadArticlesFeedTimelineQuery(i18n.locale),
  );

  return (
    <Show when={data()}>
      {(data) => (
        <>
          <TopBreadcrumb>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/">{t`Timeline`}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/feed">{t`Feed`}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink current>{t`Articles only`}</BreadcrumbLink>
            </BreadcrumbItem>
          </TopBreadcrumb>
          <div class="p-4">
            <PersonalTimeline $posts={data()} />
          </div>
        </>
      )}
    </Show>
  );
}
