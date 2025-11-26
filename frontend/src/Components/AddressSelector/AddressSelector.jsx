import React, { useEffect, useState } from "react";
import { getProvinces, getDistricts, getWards } from "../../api/locationService";
import "./AddressSelector.css";

export default function AddressSelector({ value = null, onChange }) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [province, setProvince] = useState(value?.province || null);
  const [district, setDistrict] = useState(value?.district || null);
  const [ward, setWard] = useState(value?.ward || null);
  const [houseNumber, setHouseNumber] = useState(value?.houseNumber || "");

  // Sync internal state when parent value prop changes (e.g., loaded from localStorage after mount)
  useEffect(() => {
    setProvince(value?.province || null);
    setDistrict(value?.district || null);
    setWard(value?.ward || null);
    setHouseNumber(value?.houseNumber || "");
  }, [value]);

  useEffect(() => {
    (async () => {
      const p = await getProvinces();
      setProvinces(p);
    })();
  }, []);

  useEffect(() => {
    if (province?.code) {
      (async () => {
        const ds = await getDistricts(province.code);
        setDistricts(ds);
      })();
    } else {
      setDistricts([]);
      setDistrict(null);
      setWards([]);
      setWard(null);
    }
  }, [province]);

  useEffect(() => {
    if (province?.code && district?.code) {
      (async () => {
        const ws = await getWards(province.code, district.code);
        setWards(ws);
      })();
    } else {
      setWards([]);
      setWard(null);
    }
  }, [district, province]);

  useEffect(() => {
    if (onChange) {
      onChange({ province, district, ward, houseNumber });
    }
  }, [province, district, ward, houseNumber]);

  return (
    <div className="address-selector">
      <div className="as-row">
        <label>Tỉnh/Thành</label>
        <select
          value={province?.code || ""}
          onChange={(e) =>
            setProvince(provinces.find((p) => String(p.code) === e.target.value) || null)
          }
        >
          <option value="">-- Chọn Tỉnh/Thành --</option>
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="as-row">
        <label>Quận/Huyện</label>
        <select
          value={district?.code || ""}
          onChange={(e) =>
            setDistrict(districts.find((d) => String(d.code) === e.target.value) || null)
          }
          disabled={!province}
        >
          <option value="">-- Chọn Quận/Huyện --</option>
          {districts.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="as-row">
        <label>Phường/Xã</label>
        <select
          value={ward?.code || ""}
          onChange={(e) => setWard(wards.find((w) => String(w.code) === e.target.value) || null)}
          disabled={!district}
        >
          <option value="">-- Chọn Phường/Xã --</option>
          {wards.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      <div className="as-row">
        <label>Số nhà / Địa chỉ chi tiết</label>
        <input
          type="text"
          value={houseNumber}
          placeholder="Số nhà, đường, block..."
          onChange={(e) => setHouseNumber(e.target.value)}
        />
      </div>
    </div>
  );
}
