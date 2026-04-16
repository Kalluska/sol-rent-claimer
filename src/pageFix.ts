export function handlePageSwitch(setView: any, hiddenWalletBtnRef: any) {
  setView("app");

  setTimeout(() => {
    if (hiddenWalletBtnRef?.current) {
      hiddenWalletBtnRef.current.click();
    }
  }, 100);
}
