import React, { useRef, useEffect, useMemo, useState } from "react";
import AdyenCheckout from "@adyen/adyen-web";
import { useRecoilState } from "recoil";
import CheckoutLoginDetails from "data/atoms/CheckoutLoginDetails";
import useIsAuthenticated from "data/use-is-authenticated";
import usePaymentMessage from "./usePaymentMessage";
import useFieldsHook from "./useFieldsHook";
import AdyenPayment from "./../AdyenPayment";
import { getLocalUserData } from "cache";
import useTranslation from "next-translate/useTranslation";
import { validateFields } from "./../Validation";
import ApiPutFetchOrderUserDatails from "data/api/api-put-fetch-order-user-details";
import PaymentAtom from "data/atoms/PaymentAtom";

async function updateOrderUserDetails(sessionId, putData) {
  const orderData = await ApiPutFetchOrderUserDatails(sessionId, putData);
  return orderData;
}

const usePayment = (cart, requiresPayment, setError, paymentMessageRef) => {
  const { t } = useTranslation("common");

  const [adyenCheckout, setAdyenCheckout] = useState();
  const [checkoutLoginDetails] = useRecoilState(CheckoutLoginDetails);
  const { isAuthenticated } = useIsAuthenticated();
  const { setPaymentMessage, clearPaymentMessage } =
    usePaymentMessage(adyenCheckout);

  const { detailsCompleted } = useFieldsHook();

  const [paymentAtom, setPaymentAtom] = useRecoilState(PaymentAtom);

  useEffect(() => {
    async function getAdyenCheckout(sessionObject) {
      const checkout = await AdyenCheckout(getAdyenConfig(sessionObject));
      setAdyenCheckout(checkout);
    }
    if (!adyenCheckout && checkoutLoginDetails.session && requiresPayment) {
      getAdyenCheckout(checkoutLoginDetails.session);
    }

    if (detailsCompleted) {
      validateFields(checkoutLoginDetails, setError, t);
    }
  }, [checkoutLoginDetails]);

  const onPaymentCompletedRefused = async () => {
    setPaymentMessage(paymentMessageRef);
    if (adyenCheckout) {
    } else {
      const sessionObject = checkoutLoginDetails.session;
      if (sessionObject) {
        const checkout = await AdyenCheckout(getAdyenConfig(sessionObject));
        setTimeout(() => {
          setAdyenCheckout(checkout);
        }, 2000);
      } else {
        console.log("no session object");
      }
    }
  };

  const onBeforeSubmit = (data, component, actions) => {
    const localUserData = getLocalUserData();
    const u = localUserData;

    setPaymentAtom({ loading: true });

    if (!isAuthenticated) {
      data.additionalData = {
        shopperName: `${u.firstName} ${u.lastName}`,
        shopperEmail: u.email,
        shopperTelephone: u.mobile,
      };
    }

    if (!checkoutLoginDetails.detailsInitialyCompleted) {
      updateOrderUserDetails(checkoutLoginDetails.session.id, {
        userEmail: u.email,
        userFirstname: u.firstName,
        userLastname: u.lastName,
        userMobile: u.mobile,
      }).then((res) => {
        if (res && res.success) {
          actions.resolve(data);
        } else {
          setPaymentAtom({ loading: false });
        }
      });
    } else {
      actions.resolve(data);
    }
  };

  const onPaymentResultCompleted = async () => {
    setPaymentAtom({ loading: false });
  };

  const { getAdyenConfig } = new AdyenPayment(
    onPaymentCompletedRefused,
    onBeforeSubmit,
    onPaymentResultCompleted
  );

  const onDropinReady = () => {
    setPaymentAtom({ loading: false, selectedPaymentMethod: false });
  };

  const onSelectPaymentMethod = () => {
    setPaymentAtom({ loading: false, selectedPaymentMethod: true });
    clearPaymentMessage(paymentMessageRef);
  };

  return { adyenCheckout, onSelectPaymentMethod, onDropinReady };
};

export default usePayment;
