package com.viitorul.app.repository;

import com.viitorul.app.entity.Ad;
import com.viitorul.app.entity.DeviceType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AdRepository extends JpaRepository<Ad, Long> {

    List<Ad> findAllByDeviceTypeOrderByPositionAscOrderIndexAsc(DeviceType deviceType);

    @Query("select coalesce(max(a.orderIndex), 0) " +
            "from Ad a where a.position = :pos and a.deviceType = :device")
    int maxIndexInBucket(@Param("pos") String pos, @Param("device") DeviceType device);

    @Query("select count(a) from Ad a where a.position = :pos and a.deviceType = :device")
    int countInBucket(@Param("pos") String pos, @Param("device") DeviceType device);

    // mutare în sus: ceilalți [new..old-1] +1 (EXCLUD anunțul mutat)
    @Modifying
    @Query("update Ad a set a.orderIndex = a.orderIndex + 1 " +
            "where a.position = :pos and a.deviceType = :device " +
            "and a.orderIndex between :from and :to and a.id <> :excludeId")
    int bumpUpBetween(@Param("pos") String pos,
                      @Param("device") DeviceType device,
                      @Param("from") int from,
                      @Param("to") int to,
                      @Param("excludeId") Long excludeId);

    // mutare în jos: ceilalți [old+1..new] −1 (EXCLUD anunțul mutat)
    @Modifying
    @Query("update Ad a set a.orderIndex = a.orderIndex - 1 " +
            "where a.position = :pos and a.deviceType = :device " +
            "and a.orderIndex between :from and :to and a.id <> :excludeId")
    int bumpDownBetween(@Param("pos") String pos,
                        @Param("device") DeviceType device,
                        @Param("from") int from,
                        @Param("to") int to,
                        @Param("excludeId") Long excludeId);

    // când inserezi într-un bucket: fă loc din dreapta
    @Modifying
    @Query("update Ad a set a.orderIndex = a.orderIndex + 1 " +
            "where a.position = :pos and a.deviceType = :device " +
            "and a.orderIndex >= :from")
    int shiftRightFrom(@Param("pos") String pos,
                       @Param("device") DeviceType device,
                       @Param("from") int from);

    // când scoți dintr-un bucket: compactează după poziția eliberată
    @Modifying
    @Query("update Ad a set a.orderIndex = a.orderIndex - 1 " +
            "where a.position = :pos and a.deviceType = :device " +
            "and a.orderIndex > :from")
    int compactAfter(@Param("pos") String pos,
                     @Param("device") DeviceType device,
                     @Param("from") int from);
}
