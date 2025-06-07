"use client";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { toggleSidebar } from "@/store/themeConfigSlice";
import AnimateHeight from "react-animate-height";
import { IRootState } from "@/store";
import { useState, useEffect } from "react";
import IconMenuUsers from "../icon/menu/icon-menu-users";
import IconCaretsDown from "@/components/icon/icon-carets-down";
import IconFile from "../icon/icon-file";
import { usePathname } from "next/navigation";
import { getTranslation } from "@/i18n";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { t } = getTranslation();
  const pathname = usePathname();
  const [currentMenu, setCurrentMenu] = useState<string>("");
  const [errorSubMenu, setErrorSubMenu] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);

  useEffect(() => {

    const storedId = localStorage.getItem("userId");



    console.log("OWNER ID FROM LOCALSTORAGE:", storedId);

    if (storedId) {
      setOwnerId(storedId);
      setIsLoading(false);
    } else {
      setError("Owner ID not found");
      setIsLoading(false);
    }
  }, []);

  const toggleMenu = (value: string) => {
    setCurrentMenu((oldValue) => {
      return oldValue === value ? "" : value;
    });
  };

  useEffect(() => {
    const selector = document.querySelector(
      '.sidebar ul a[href="' + window.location.pathname + '"]'
    );
    if (selector) {
      selector.classList.add("active");
      const ul: any = selector.closest("ul.sub-menu");
      if (ul) {
        let ele: any = ul.closest("li.menu").querySelectorAll(".nav-link") || [];
        if (ele.length) {
          ele = ele[0];
          setTimeout(() => {
            ele.click();
          });
        }
      }
    }
  }, []);

  useEffect(() => {
    setActiveRoute();
    if (window.innerWidth < 1024 && themeConfig.sidebar) {
      dispatch(toggleSidebar());
    }
  }, [pathname]);

  const setActiveRoute = () => {
    let allLinks = document.querySelectorAll(".sidebar ul a.active");
    for (let i = 0; i < allLinks.length; i++) {
      const element = allLinks[i];
      element?.classList.remove("active");
    }
    const selector = document.querySelector(
      '.sidebar ul a[href="' + window.location.pathname + '"]'
    );
    selector?.classList.add("active");
  };

  return (
    <div className={semidark ? "dark" : ""}>
      <nav
  className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] bg-white dark:bg-black shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 text-black dark:text-white-dark`}
>

        <div className="h-full bg-white dark:bg-black">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 dark:text-white-light dark:hover:bg-dark-light/10 rtl:rotate-180"
             
            >
              <IconCaretsDown className="m-auto rotate-90" />
            </button>
          </div>
          <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
            <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
              <li className="nav-item">
                <ul>
                  <li className="nav-item">
                    {isLoading ? (
                      <div className="flex items-center">
                        <IconFile className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3"
 />
                       <span className="ml-3 text-black dark:text-white whitespace-nowrap">
                          {t("Loading...")}
                        </span>
                      </div>
                    ) : error || !ownerId ? (
                      <div className="flex items-center">
                        <IconFile className="shrink-0 group-hover:!text-primary" />
                        <span className="text-red-500 ltr:pl-3 rtl:pr-3">
                          {t("Error: Failed to load project")}
                        </span>
                      </div>
                    ) : (
                      <>

                        <Link
                          href={`/ownerProfile/${ownerId}`}
                          className="group"
                        >
                          <div className="flex items-center mt-2">
                            <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                            <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                              {t("Profile")}
                            </span>
                          </div>
                        </Link>
                        <Link
                          href={`/projects/assignees/${ownerId}`}
                          className="group"
                        >
                          <div className="flex items-center">
                            <IconFile className="shrink-0 group-hover:!text-primary" />
                            <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                              {t("Project")}
                            </span>
                          </div>
                        </Link>

                      </>
                    )}
                  </li>
                </ul>

              </li>
            </ul>
          </PerfectScrollbar>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
