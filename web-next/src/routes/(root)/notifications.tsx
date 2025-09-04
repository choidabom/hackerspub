import { Navigate, query } from "@solidjs/router";
import { graphql } from "relay-runtime";
import { Show } from "solid-js";
import {
  createPreloadedQuery,
  loadQuery,
  useRelayEnvironment,
} from "solid-relay";
import { NotificationList } from "~/components/NotificationList.tsx";
import { Title } from "~/components/Title.tsx";
import { TopBreadcrumb } from "~/components/TopBreadcrumb.tsx";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb.tsx";
import { useLingui } from "~/lib/i18n/macro.d.ts";
import type { notificationsPageQuery } from "./__generated__/notificationsPageQuery.graphql.ts";

const notificationsPageQuery = graphql`
  query notificationsPageQuery {
    viewer {
      ...NotificationList_notifications
    }
  }
`;

const loadPageQuery = query(
  () =>
    loadQuery<notificationsPageQuery>(
      useRelayEnvironment()(),
      notificationsPageQuery,
      {},
    ),
  "loadNotificationsPageQuery",
);

export default function NotificationsPage() {
  const { t } = useLingui();
  const data = createPreloadedQuery<notificationsPageQuery>(
    notificationsPageQuery,
    () => loadPageQuery(),
  );
  return (
    <>
      <Title>{t`Hackers' Pub: Notifications`}</Title>
      <TopBreadcrumb>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink current>
            {t`Notifications`}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </TopBreadcrumb>
      <div class="p-4">
        <Show when={data()}>
          {(data) => (
            <Show
              when={data().viewer}
              fallback={<Navigate href="/sign?next=%2Fnotifications" />}
            >
              {(viewer) => <NotificationList $account={viewer()} />}
            </Show>
          )}
        </Show>
      </div>
    </>
  );
}
