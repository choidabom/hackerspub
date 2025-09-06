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
import type { withoutSharesFeedTimelineQuery } from "./__generated__/withoutSharesFeedTimelineQuery.graphql.ts";

export const route = {
  preload() {
    const { i18n } = useLingui();
    void loadWithoutSharesFeedTimelineQuery(i18n.locale);
  },
} satisfies RouteDefinition;

const withoutSharesFeedTimelineQuery = graphql`
  query withoutSharesFeedTimelineQuery($locale: Locale) {
    ...PersonalTimeline_posts @arguments(locale: $locale, withoutShares: true)
  }
`;

const loadWithoutSharesFeedTimelineQuery = query(
  (locale: string) =>
    loadQuery<withoutSharesFeedTimelineQuery>(
      useRelayEnvironment()(),
      withoutSharesFeedTimelineQuery,
      { locale },
    ),
  "loadWithoutSharesFeedTimelineQuery",
);

export default function WithoutSharesFeedTimeline() {
  const { i18n, t } = useLingui();
  const data = createPreloadedQuery<withoutSharesFeedTimelineQuery>(
    withoutSharesFeedTimelineQuery,
    () => loadWithoutSharesFeedTimelineQuery(i18n.locale),
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
              <BreadcrumbLink current>{t`Without shares`}</BreadcrumbLink>
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
