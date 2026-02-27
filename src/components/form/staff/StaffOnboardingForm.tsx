import { useForm } from "react-hook-form";
import { Button } from "../../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import type { Staff } from "../../../types/staffType";
import { createStaff, type CreateStaffPayload } from "../../../api/staff.api";
import { useState } from "react";
import { Specialization, PractitionerType } from "../../../types/staffType";

/* ---------- HOOKS ---------- */
import { useCountries } from "../../../hooks/useCountries";
import { useStates } from "../../../hooks/useStates";
import { useCities } from "../../../hooks/useCities";
import { useCountryCodes } from "../../../hooks/useCountryCodes";
import { useLanguage } from "../../../language/useLanguage";
import strings from "../../../language";

import axios from "axios";
import type { ApiErrorResponse } from "../../../types/apiError";
import { Loader2 } from "lucide-react";

type Props = {
  onCreate: (staff: Staff) => void;
};

export default function StaffOnboardingForm({ onCreate }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { language } = useLanguage();
  const t = strings[language];

  const form = useForm<Staff>({
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      gender: "",
      specialization: undefined,
      practitionerType: undefined,
      address: {
        street: "",
        country: "",
        countryCode: "",
        state: "",
        city: "",
        zipCode: "",
      },
    },
  });

  const { control, handleSubmit, reset } = form;

  /* ---------- WATCH ---------- */
  const country = form.watch("address.country") || "";
  const state = form.watch("address.state") || "";

  /* ---------- DATA ---------- */
  const countries = useCountries();
  const states = useStates(country);
  const cities = useCities(country, state);
  const countryCodes = useCountryCodes();

  const inputClass =
    "h-9 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0";

  const selectTriggerClass =
    "h-9 shadow-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0";

  async function onSubmit(values: Staff) {
    setIsSubmitting(true);
    setError(null);

    try {
      const { id, addresses, ...staffDataWithoutId } = values;
      const staffData: CreateStaffPayload = {
        ...staffDataWithoutId,
        address: values.address || {
          street: "",
          city: "",
          state: "",
          country: "",
          countryCode: "",
          zipCode: "",
        },
      };

      // Map country name back to code for connection
      if (staffData.address && staffData.address.countryCode) {
        const selected = countryCodes.find(
          (c) => c.value === staffData.address.countryCode,
        );
        if (selected) {
          staffData.address.countryCode = selected.code;
        }
      }

      console.log("Submitting staff data:", staffData);

      const savedStaff = await createStaff(staffData);

      console.log("Staff saved successfully:", savedStaff);

      const staffWithAddress = {
        ...savedStaff,
        address:
          savedStaff.addresses && savedStaff.addresses.length > 0
            ? savedStaff.addresses[0]
            : savedStaff.address,
      };

      onCreate(staffWithAddress);
      reset();
    } catch (err: unknown) {
      console.error("Error creating staff:", err);

      let errorMessage = t.staff.form.errors.createFailed;

      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        const message = err.response?.data?.message;

        if (Array.isArray(message)) {
          errorMessage = message.join(", ");
        } else if (typeof message === "string") {
          errorMessage = message;
        } else if (err.message) {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* ---------- NAME ---------- */}
        <div className="flex items-center gap-2 pt-6">
          <span className="h-6 w-1 bg-brand-500 rounded-full block"></span>
          <h3 className="text-sm font-bold">{t.staff.form.personalInfo}</h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={control}
            name="firstName"
            rules={{ required: t.staff.form.validation.firstNameRequired }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">
                  {t.staff.form.firstName}{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t.staff.form.enter}
                    {...field}
                    className={inputClass}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="middleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.staff.form.middleName}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t.staff.form.enter}
                    {...field}
                    className={inputClass}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="lastName"
            rules={{ required: t.staff.form.validation.lastNameRequired }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">
                  {t.staff.form.lastName}{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t.staff.form.enter}
                    {...field}
                    className={inputClass}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ---------- CONTACT ---------- */}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="email"
            rules={{
              required: t.staff.form.validation.emailRequired,
              pattern: {
                value: /^\S+@\S+$/i,
                message: t.staff.form.validation.invalidEmail,
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">
                  {t.staff.form.email} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t.staff.form.email}
                    {...field}
                    className={inputClass}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2 w-full">
            <FormField
              control={control}
              name="address.countryCode"
              render={({ field }) => (
                <FormItem className="w-[140px]">
                  <FormLabel className="text-black dark:text-white">
                    {t.staff.form.countryCode}
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-9 shadow-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                        <SelectValue placeholder={t.staff.form.selectCode}>
                          {field.value ? (
                            (() => {
                              const selected = countryCodes.find(
                                (c) => c.value === field.value,
                              );
                              return selected ? (
                                <div className="flex items-center gap-2">
                                  <img
                                    src={selected.flag}
                                    alt={selected.name}
                                    className="h-4 w-6 object-cover rounded-sm"
                                  />
                                  <span className="text-xs text-muted-foreground mr-1">
                                    {selected.code}
                                  </span>
                                </div>
                              ) : (
                                field.value
                              );
                            })()
                          ) : (
                            <span className="text-muted-foreground">
                              {t.staff.form.selectCode}
                            </span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent className="max-h-60 overflow-y-auto">
                      {countryCodes.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <img
                              src={option.flag}
                              alt={option.name}
                              className="h-4 w-6 object-cover rounded-sm"
                            />
                            <span className="truncate max-w-[120px]">
                              {option.name}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {option.code}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="phoneNumber"
              rules={{
                required: t.staff.form.validation.phoneRequired,
                // Allow only digits (no letters, no symbols)
                pattern: {
                  value: /^[0-9]+$/,
                  message: t.staff.form.validation.digitsOnly,
                },

                // Minimum 10 digits (common global minimum)
                minLength: {
                  value: 10,
                  message: t.staff.form.validation.minDigits,
                },

                // Maximum 15 digits (E.164 international standard max length)
                maxLength: {
                  value: 15,
                  message: t.staff.form.validation.maxDigits,
                }, // Extra validation (optional but professional)
                validate: (value) => {
                  // Reject numbers starting with 0 only repeated (e.g., 0000000000)
                  if (/^0+$/.test(value)) {
                    return t.staff.form.validation.invalidContact;
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-black dark:text-white">
                    {t.staff.form.phoneNumber}{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.staff.form.phoneNumber}
                      {...field}
                      className="h-9 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="gender"
            rules={{ required: t.staff.form.validation.genderRequired }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">
                  {t.staff.form.gender} <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder={t.staff.form.selectGender} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    position="popper"
                    className="max-h-60 overflow-y-auto"
                  >
                    <SelectItem value="Male">
                      {t.staff.form.genderOptions.male}
                    </SelectItem>
                    <SelectItem value="Female">
                      {t.staff.form.genderOptions.female}
                    </SelectItem>
                    <SelectItem value="Other">
                      {t.staff.form.genderOptions.other}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ---------- GENDER + SPECIALIZATION + PRACTITIONER TYPE ---------- */}
        <div className="flex items-center gap-2 pt-6">
          <span className="h-6 w-1 bg-brand-500 rounded-full block"></span>
          <h3 className="text-sm font-bold">{t.staff.form.professionalInfo}</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="specialization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.staff.form.specialization}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue
                        placeholder={t.staff.form.selectSpecialization}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    position="popper"
                    className="max-h-60 overflow-y-auto"
                  >
                    <SelectItem value={Specialization.ORTHODONTICS}>
                      Orthodontics
                    </SelectItem>
                    <SelectItem value={Specialization.ENDODONTICS}>
                      Endodontics
                    </SelectItem>
                    <SelectItem value={Specialization.PERIODONTICS}>
                      Periodontics
                    </SelectItem>
                    <SelectItem value={Specialization.RADIOLOGY}>
                      Radiology
                    </SelectItem>
                    <SelectItem value={Specialization.PUBLIC_HEALTH}>
                      General Dentist
                    </SelectItem>
                    <SelectItem value={Specialization.ANESTHESIOLOGY}>
                      Anesthesiology
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="practitionerType"
            rules={{
              required: t.staff.form.validation.practitionerTypeRequired,
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">
                  {t.staff.form.role}
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder={t.staff.form.selectRole} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    position="popper"
                    className="max-h-60 overflow-y-auto"
                  >
                    <SelectItem value={PractitionerType.ADMIN}>
                      Admin
                    </SelectItem>
                    <SelectItem value={PractitionerType.TEAM_MEMBER}>
                      Team Member
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ---------- ADDRESS ---------- */}
        <div className="flex items-center gap-2 pt-6">
          <span className="h-6 w-1 bg-brand-500 rounded-full block"></span>
          <h3 className="text-sm font-bold">{t.staff.form.addresses}</h3>
        </div>

        <div className="space-y-4">
          {/* STREET + COUNTRY */}
          <div className="grid grid-cols-4 gap-4">
            <FormField
              control={control}
              name="address.street"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>{t.staff.form.street}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.staff.form.enter}
                      {...field}
                      className={inputClass}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="address.country"
              rules={{ required: t.staff.form.validation.countryRequired }}
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="text-black dark:text-white">
                    {t.staff.form.country}{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("address.state", "");
                      form.setValue("address.city", "");
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder={t.staff.form.selectCountry}>
                          {field.value
                            ? (() => {
                                const selected = countries.find(
                                  (c) => c.name === field.value,
                                );
                                return selected ? (
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={selected.flag}
                                      alt={selected.name}
                                      className="h-4 w-6 object-cover rounded-sm"
                                    />
                                    <span>{selected.name}</span>
                                  </div>
                                ) : (
                                  field.value
                                );
                              })()
                            : t.staff.form.selectCountry}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent
                      side="bottom"
                      sideOffset={4}
                      avoidCollisions={false}
                      className="max-h-60 overflow-y-auto"
                    >
                      {countries.map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          <div className="flex items-center gap-2">
                            <img
                              src={c.flag}
                              alt={c.name}
                              className="h-4 w-6 object-cover rounded-sm"
                            />
                            <span>{c.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* STATE + CITY + ZIP */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="address.state"
              rules={{ required: t.staff.form.validation.stateRequired }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black dark:text-white">
                    {t.staff.form.state} <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("address.city", "");
                    }}
                    disabled={!country}
                  >
                    <FormControl>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder={t.staff.form.selectState} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent
                      position="popper"
                      className="max-h-60 overflow-y-auto"
                    >
                      {states.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="address.city"
              rules={{ required: t.staff.form.validation.cityRequired }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black dark:text-white">
                    {t.staff.form.city} <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!state}
                  >
                    <FormControl>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder={t.staff.form.selectCity} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent
                      position="popper"
                      className="max-h-60 overflow-y-auto"
                    >
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="address.zipCode"
              rules={{ required: t.staff.form.validation.zipCodeRequired }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black dark:text-white">
                    {t.staff.form.zipCode}{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.staff.form.enter}
                      {...field}
                      className={inputClass}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ---------- ERROR MESSAGE ---------- */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/*  ACTIONS  */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="submit"
            className="h-9 rounded-md bg-brand-button px-4 text-sm font-medium text-white hover:bg-brand-button/80 transition-opacity duration-200 "
            // style={{ backgroundColor: "var(--brand-button)" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.staff.form.creating}
              </span>
            ) : (
              t.staff.form.addStaffButton
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
