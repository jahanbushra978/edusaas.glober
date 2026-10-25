import React, { useState, useMemo, useEffect, useRef } from "react";

export default function AnimatedCounterSpinner({ targetValue }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef(null);

  const parseNum = (str) => {
    if (!str) return 0;
    const bnToEn = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
    const cleaned = str.replace(/[০-৯]/g, (match) => bnToEn[match]).replace(/,/g, '');
    const matched = cleaned.match(/[\d.]+/);
    return matched ? parseFloat(matched[0]) : 0;
  };

  const toBengaliDigits = (num) => {
    const enToBn = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
    return num.toString().replace(/\d/g, (match) => enToBn[match]);
  };

  const finalValue = useMemo(() => parseNum(targetValue), [targetValue]);
  const isDecimal = targetValue.includes('.');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.2 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted || finalValue <= 0) return;

    let start = 0;
    const duration = 1800; // 1.8 seconds animation
    const steps = 50;
    const increment = finalValue / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= finalValue) {
        setCount(finalValue);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [hasStarted, finalValue]);

  const formattedCount = useMemo(() => {
    if (!hasStarted) return "০";
    if (isDecimal) {
      return toBengaliDigits(count.toFixed(1));
    }
    const rounded = Math.floor(count);
    const withCommas = rounded.toLocaleString('en-US');
    return toBengaliDigits(withCommas);
  }, [count, hasStarted, isDecimal]);

  const formattedSuffix = useMemo(() => {
    if (targetValue.includes('+')) return '+';
    if (targetValue.includes('%')) return '%';
    if (targetValue.includes('/৭')) return '/৭';
    return '';
  }, [targetValue]);

  return (
    <span ref={elementRef} className="inline-flex items-center">
      {formattedCount}{formattedSuffix}
    </span>
  );
}
