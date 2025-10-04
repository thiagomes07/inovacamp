import React, { useState, forwardRef } from "react";
import InputMask from "react-input-mask";
import { Input } from "../../../../components/ui/input";

interface MaskedInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange"
  > {
  mask:
    | "cpf"
    | "cnpj"
    | "phone"
    | "currency"
    | "money"
    | "date"
    | "usd"
    | "creditCard"
    | "expiryDate"
    | "cvv";
  value?: string;
  onChange?: (value: string) => void;
  isValid?: boolean;
  currency?: "BRL" | "USD" | "USDC";
}

const masks = {
  cpf: {
    pattern: /(\d{3})(\d{3})(\d{3})(\d{2})/,
    format: "$1.$2.$3-$4",
    placeholder: "000.000.000-00",
    maxLength: 14,
  },
  cnpj: {
    pattern: /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    format: "$1.$2.$3/$4-$5",
    placeholder: "00.000.000/0000-00",
    maxLength: 18,
  },
  phone: {
    pattern: /(\d{2})(\d{5})(\d{4})/,
    format: "($1) $2-$3",
    placeholder: "(00) 00000-0000",
    maxLength: 15,
  },
  currency: {
    pattern: /(\d+)(\d{2})/,
    format: "R$ $1,$2",
    placeholder: "R$ 0,00",
    maxLength: 20,
  },
  money: {
    pattern: /(\d+)(\d{2})/,
    format: "R$ $1,$2",
    placeholder: "R$ 0,00",
    maxLength: 20,
  },
  date: {
    pattern: /(\d{2})(\d{2})(\d{4})/,
    format: "$1/$2/$3",
    placeholder: "DD/MM/AAAA",
    maxLength: 10,
  },
  usd: {
    pattern: /(\\d+)(\\d{2})/,
    format: "$ $1.$2",
    placeholder: "$ 0.00",
    maxLength: 20,
  },
  creditCard: {
    pattern: /(\\d{4})(\\d{4})(\\d{4})(\\d{4})/,
    format: "$1 $2 $3 $4",
    placeholder: "0000 0000 0000 0000",
    maxLength: 19,
  },
  expiryDate: {
    pattern: /(\\d{2})(\\d{2})/,
    format: "$1/$2",
    placeholder: "MM/YY",
    maxLength: 5,
  },
  cvv: {
    pattern: /(\\d{3,4})/,
    format: "$1",
    placeholder: "000",
    maxLength: 4,
  },
};

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  (
    {
      mask,
      value = "",
      onChange,
      isValid,
      className = "",
      placeholder,
      currency = "BRL",
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState(value);
    const maskConfig = masks[mask];

    if (!maskConfig) {
      console.error(`Invalid mask type: ${mask}`);
      return (
        <Input
          {...props}
          ref={ref}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={className}
        />
      );
    }

    const applyMask = (inputValue: string) => {
      // Remove all non-numeric characters
      const numbers = inputValue.replace(/\D/g, "");

      if (mask === "currency" || mask === "money") {
        if (numbers === "") return "";

        if (currency === "BRL") {
          if (numbers.length <= 2) {
            return `R$ 0,${numbers.padStart(2, "0")}`;
          }
          const cents = numbers.slice(-2).padStart(2, "0");
          const reais = numbers.slice(0, -2) || "0";
          return `R$ ${parseInt(reais).toLocaleString("pt-BR")},${cents}`;
        } else if (currency === "USD" || currency === "USDC") {
          if (numbers.length <= 2) {
            return `$ 0.${numbers.padStart(2, "0")}`;
          }
          const cents = numbers.slice(-2);
          const dollars = numbers.slice(0, -2);
          return `$ ${parseInt(dollars).toLocaleString("en-US")}.${cents}`;
        }
      }

      if (mask === "usd") {
        if (numbers === "") return "";
        if (numbers.length <= 2) {
          return `$ 0.${numbers.padStart(2, "0")}`;
        }
        const cents = numbers.slice(-2);
        const dollars = numbers.slice(0, -2);
        return `$ ${parseInt(dollars).toLocaleString("en-US")}.${cents}`;
      }

      if (numbers.length === 0) return "";

      // Handle credit card
      if (mask === "creditCard") {
        if (numbers.length <= 4) return numbers;
        if (numbers.length <= 8)
          return `${numbers.slice(0, 4)} ${numbers.slice(4)}`;
        if (numbers.length <= 12)
          return `${numbers.slice(0, 4)} ${numbers.slice(4, 8)} ${numbers.slice(
            8
          )}`;
        return `${numbers.slice(0, 4)} ${numbers.slice(4, 8)} ${numbers.slice(
          8,
          12
        )} ${numbers.slice(12, 16)}`;
      }

      // Handle expiry date
      if (mask === "expiryDate") {
        if (numbers.length <= 2) return numbers;
        return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`;
      }

      // Handle CVV (no formatting needed, just limit length)
      if (mask === "cvv") {
        return numbers.slice(0, 4);
      }

      // Handle CPF/CNPJ auto-detection
      if (mask === "cpf" && numbers.length > 11) {
        // Switch to CNPJ format if more than 11 digits
        const cnpjConfig = masks.cnpj;
        if (cnpjConfig && cnpjConfig.pattern) {
          const match = numbers.match(cnpjConfig.pattern);
          if (match) {
            return cnpjConfig.format.replace(
              /\$(\d+)/g,
              (_, index) => match[parseInt(index)] || ""
            );
          }
        }
      }

      if (maskConfig.pattern) {
        const match = numbers.match(new RegExp(maskConfig.pattern.source));
        if (match) {
          return maskConfig.format.replace(
            /\$(\d+)/g,
            (_, index) => match[parseInt(index)] || ""
          );
        }
      }

      return numbers;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const maskedValue = applyMask(newValue);

      setDisplayValue(maskedValue);
      onChange?.(maskedValue);
    };

    const borderColor =
      isValid === undefined
        ? "border-gray-600"
        : isValid
        ? "border-green-500"
        : "border-red-500";

    // Dynamic placeholder based on currency
    const getDynamicPlaceholder = () => {
      if ((mask === "currency" || mask === "money") && currency) {
        return currency === "BRL" ? "R$ 0,00" : "$ 0.00";
      }
      return placeholder || maskConfig.placeholder;
    };

    return (
      <InputMask
        mask={getDynamicPlaceholder()}
        value={displayValue}
        onChange={handleChange}
        maskChar=""
      >
        {(inputProps) => (
          <Input
            {...props}
            ref={ref}
            {...inputProps}
            value={displayValue}
            onChange={handleChange}
            placeholder={getDynamicPlaceholder()}
            maxLength={maskConfig.maxLength}
            className={`bg-gray-800 border-2 ${borderColor} text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/50 ${className}`}
          />
        )}
      </InputMask>
    );
  }
);

MaskedInput.displayName = "MaskedInput";
