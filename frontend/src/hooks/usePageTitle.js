import { useEffect } from "react";

const SITE_TITLE = "TaskFlow";

const usePageTitle = (pageTitle) => {
  useEffect(() => {
    if (pageTitle) {
      document.title = `${pageTitle} • ${SITE_TITLE}`;
    } else {
      document.title = `${SITE_TITLE} • Smart Task Manager`;
    }
  }, [pageTitle]);
};

export default usePageTitle;
